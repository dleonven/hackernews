import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'

class Search extends Component {

  state = {
    links: [],
    filter: ''
  }

  render() {
    return (
      <div>
        <div>
          Search

          {/*As the user types on the input, the filter state updates (to be able to filter the Links)*/}
          <input
            type='text'
            onChange={(e) => this.setState({ filter: e.target.value })}
          />
          {/*If the button is clicked, calls the function that gets the filtered
            Links from the backend and sets the 'links' state to them*/}
          <button
            onClick={() => this._executeSearch()}
          >
            OK
          </button>

        {/*Calls the Link component and maps the filtered links, passing link and index for the position*/}
        </div>
        {this.state.links.map((link, index) => <Link key={link.id} link={link} index={index}/>)}
      </div>
    )
  }

  /*Gets the filtered links from the backend and sets the 'links' state to them*/
  _executeSearch = async () => {

    //get the filter from the state
    const { filter } = this.state

    //get the filtered links from the backend
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })
    const links = result.data.feed.links

    //set state to filtered links
    this.setState({ links })
  }

}

const FEED_SEARCH_QUERY = gql`

  # takes in an argument called filter that will be used to constrain the list
  # of links you want to retrieve

  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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
`

/*we actually want to load the data every time the user hits the search-button
- not upon the initial load of the component

That’s the purpose of the withApollo function. This function injects the
ApolloClient instance that you created in index.js into the Search component as
a new prop called client

This client has a method called query which you can use to send a query manually
instead of using the graphql higher-order component*/
export default withApollo(Search)
