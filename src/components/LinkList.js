import React, { Component } from 'react'
import Link from './Link'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import { LINKS_PER_PAGE } from '../constants'

class LinkList extends Component {

  /*Function called in Link.js*/
  _updateCacheAfterVote = (store, createVote, linkId) => {

    /*computation of the variables depending on
    whether the user currently is on the /top or /new route*/
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)

    /*Variable that have to be passed in the query*/
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null

    /* 1
    Read the current state of the cached data for the
    FEED_QUERY from the store
    */
    const data = store.readQuery({ query: FEED_QUERY, variables: { first, skip, orderBy } })

    /* 2*/
    /*Retrieve the link that the user just voted for from that list*/
    const votedLink = data.feed.links.find(link => link.id === linkId)
    /*reset its votes to the votes that were just returned by the server*/
    votedLink.votes = createVote.link.votes
    /* 3
    - you take the modified data and write it back into the store
    - The store update will trigger a rerender of the component and thus update
    the UI with the correct information
    */
    store.writeQuery({ query: FEED_QUERY, data })
  }

  /*make sure that the component actually subscribes to the events by calling
  _subscribeToNewLinks*/
  componentDidMount() {
    this._subscribeToNewLinks()
    this._subscribeToNewVotes()
  }

  /*subscribe to new links that are submitted by OTHER users so that the
  latest links list is always visible in the app*/
  _subscribeToNewLinks = () => {

    /*
    - You’re using the feedQuery that you have access to inside the component’s
    props (because you wrapped it with the graphql container) to call subscribeToMore
    - This call opens up a websocket connection to the subscription server
    */
    this.props.feedQuery.subscribeToMore({

      //- You’re passing two arguments to subscribeToMore

      /*First argument:
      - document: This represents the subscription query itself. In your case, the
      subscription will fire every time a new link is created
      */
      document: gql`
        subscription {
          newLink {
            node {
              id
              url
              description
              createdAt
              postedBy {
                id
                name
              }
              votes {
                id
                user {
                  id
                }
              }
            }
          }
        }
      `,

      /*Second argument:
      - updateQuery function: Similar to update, this function allows you to determine how
      the store should be updated with the information that was sent by the server
      after the event occurred
      - It takes 2 arguments:
        1. the previous state (of the query that subscribeToMore
        was called on)
        2. the subscription data that’s sent by the server.
      - You can then determine how to merge the subscription data into the existing state
      and return the updated data*/
      updateQuery: (previous, { subscriptionData }) => {

        /*retrieve (get) the new link from the received subscriptionData*/
        const newAllLinks = [subscriptionData.data.newLink.node, ...previous.feed.links]
        /*merge it into the existing list of links*/
        const result = {
          ...previous,
          feed: {
            links: newAllLinks
          }
        }
        /*return the result of this operation*/
        return result
      },
    })
  }

  /*subscribe to new votes that are submitted by OTHER users so that the
  latest vote count is always visible in the app*/
  _subscribeToNewVotes = () => {

    /*you’re calling subscribeToMore on the feedQuery. This time you’re passing
    in a subscription that asks for newly created votes. When the subscription
    fires, Apollo Client automatically updates the link that was voted on*/
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newVote {
            node {
              id
              link {
                id
                url
                description
                createdAt
                postedBy {
                  id
                  name
                }
                votes {
                  id
                  user {
                    id
                  }
                }
              }
              user {
                id
              }
            }
          }
        }
      `,
    })
  }


  /*For the newPage, you’ll simply return all the links returned by the query.
  That’s logical since here you don’t have to make any manual modifications to
  the list that is to be rendered. If the user loaded the component from the /top
  route, you’ll sort the list according to the number of votes and return the top 10 links*/
  _getLinksToRender = (isNewPage) => {

    /*if its in the new links path*/
    if (isNewPage) {
      /*
      - feed (this name is in the query):
        - This is the actual data that was received from the server.
        - It has the links property which represents a list of Link elements
      - For the newPage, you’ll simply return all the links returned by the query
      */
      return this.props.feedQuery.feed.links
    }

    /*
    - if it's not in the new links list path
    - If the user loaded the component from the /top route, you’ll sort the list
    according to the number of votes and return the top 10 links
    */
    const rankedLinks = this.props.feedQuery.feed.links.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)

    return rankedLinks
  }

  _nextPage = () => {
    /*get the current page number from the url*/
    const page = parseInt(this.props.match.params.page, 10)
    /*sanity check to make sure that it makes sense to paginate forth*/
    if (page <= this.props.feedQuery.feed.count / LINKS_PER_PAGE) {
      /*calculate the next page*/
      const nextPage = page + 1
      /*
      - tell the router where to navigate next
      - The router will then reload the component with a new page in the url
      that will be used to calculate the right chunk of links to load
      */
      this.props.history.push(`/new/${nextPage}`)
    }
  }

  _previousPage = () => {
    /*get the current page number from the url*/
    const page = parseInt(this.props.match.params.page, 10)
    /*sanity check to make sure that it makes sense to paginate back*/
    if (page > 1) {
      /*calculate the next page*/
      const previousPage = page - 1
      /*
      - tell the router where to navigate next
      - The router will then reload the component with a new page in the url
      that will be used to calculate the right chunk of links to load
      */
      this.props.history.push(`/new/${previousPage}`)
    }
  }

  /*calculate the list of links to be rendered*/
  render() {

    /*
    Apollo injected a new prop into the component called feedQuery
    This prop always brings 3 fields that provide information about the state of
    the network request


    1.
    loading: Is true as long as the request is still ongoing and the response
    hasn’t been received
    */
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading</div>
    }

    /*2
    error: In case the request fails, this field will contain information about
    what exactly went wrong
    */
    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>
    }

    /*3

    */

    /*true if it is currently on path with 'new, false otherwise'*/
    const isNewPage = this.props.location.pathname.includes('new')

    const linksToRender = this._getLinksToRender(isNewPage)
    //const page = parseInt(this.props.match.params.page, 10)

    return (
      <div>
        {/*Link element will also render its position inside the list, so you
          have to pass down an index from the LinkList component*/}
        <div>
          {linksToRender.map((link, index) => (
            <Link
              key={link.id}
              updateStoreAfterVote={this._updateCacheAfterVote}
              index={index}
              link={link}/>
          ))}
        </div>
        {isNewPage &&
        <div className='flex ml4 mv3 gray'>
          {/*two button elements to the bottom of the LinkList component that can
            be used to navigate back and forth*/}
          <div className='pointer mr2' onClick={() => this._previousPage()}>Previous</div>
          <div className='pointer' onClick={() => this._nextPage()}>Next</div>
        </div>
        }
      </div>
    )
  }
}

/*1
- First, you create the JavaScript constant called FEED_QUERY that stores the
query. The gql function is used to parse the plain string that contains the
GraphQL code
- query:
  - reads data from the server, which later can be used from a prop object
  - In this case, it has the links property which represents a list of Link elements
*/
export const FEED_QUERY = gql`

  # - 2 (comment) Now you define the actual GraphQL query.
  # - FeedQuery is the operation name and will be used by Apollo to refer to
  #   this query under the hood
  # - Pagination arguments:
  #     1. Skip:
  #     - defines the offset where the query will start.
  #     - If you passed a value of e.g. 10 for this argument, it means that the first 10 items of
  #     the list will not be included in the response
  #     2. First:
  #     - defines the limit, or how many elements, you want to load from that list.
  #     - Say, you’re passing the 10 for skip and 5 for first, you’ll receive items 10 to 15 from the list
  #     3. OrdeBy: defines how the returned list should be sorted


  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      links {
        id
        createdAt
        url
        description

        # - include information about the user who posted a link as well as
        #   information about the links’ votes in the query’s payload

        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`


/*3
- We’re using the graphql container to “wrap” the LinkList component
with the FEED_QUERY
- Note that you’re also passing an options object to the function call where you
specify the name to be feedQuery
- This is the name of the prop that Apollo injects into the LinkList component
- If you didn’t specify it here, the injected prop would be called data by default

- But how can we pass the variables needed by the query when using the graphql
container which is fetching the data under the hood?
- You need to provide the arguments right where you’re wrapping your component with the query
*/
export default graphql(FEED_QUERY, {
  name: 'feedQuery',

  /*
  - You’re now passing a function to graphql that takes in the props of the component
  (ownProps) before the query is executed
  - This allows you to get the information about the current page from the router
  (ownProps.match.params.page) and use it to calculate the chunk of links that you
  retrieve with first and skip.
  */
  options: ownProps => {

    /*
    - parseInt(string, radix): radix is specify which numeral system to be used,
    for example, a radix of 16 (hexadecimal), 10 (decimal)
    - ownProps.match.params.page: number of page (in the new links list), 1,2,3..
    */
    const page = parseInt(ownProps.match.params.page, 10)

    /*true if it's in the new pages path, false otherwise*/
    const isNewPage = ownProps.location.pathname.includes('new')

    /*
    - If it is in the new links path, calculate how many links the query should skip
    - If it isn't, skip 0 links
    */
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0

    /*
    - If it is in the new links path, the query should bring the first LINKS_PER_PAGE
    links (after the skipped ones)
    - If it isn't, the query should bring the first 100 links (after 0 skipped)
    */
    const first = isNewPage ? LINKS_PER_PAGE : 100

    /*
    - Also note that you’re including the ordering attribute createdAt_DESC for the new
    page to make sure the newest links are displayed first.
    - The ordering for the /top route will be calculated manually based on the number
    of votes for each link
    */
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {
      variables: { first, skip, orderBy },
    }
  },
})(LinkList)
