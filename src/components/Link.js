import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { timeDifferenceForDate } from '../utils'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

class Link extends Component {
  render() {

    /*localStorage?*/
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">

          {/*The number of the position of the Link*/}
          <span className="gray">{this.props.index + 1}.</span>

          {/*
            - Render the upvote button if a user is currently logged in - that’s what
            you’re using the authToken for
            - If clicked, call the voteForLink function, which updates backend and store/cache
          */}
          {authToken && (
            <div className="ml1 gray f11" onClick={() => this._voteForLink()}>
              ▲
            </div>
          )}
        </div>
        <div className="ml1">
          <div>
            {/*
              - this.props.link: prop passed by LinkList component
              - Contains description, url, createdAt, postedBy and more
              - Fields taken from the backend with the feedQuery query
            */}
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{' '}
{/*If the Link is not associated with a User, the user’s name will be displayed
  as Unknown*/}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : 'Unknown'}{' '}

            {/*This function will take the timestamp and convert it to a string
              that’s more user friendly, e.g. "3 hours ago".*/}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    )
  }

  /*
  - Function called when an authenticated user clicks the vote button
  - Updates the backend and the store/cache
  */
  _voteForLink = async () => {

    /*prop passed from LinkList*/
    const linkId = this.props.link.id

    /*
    - Mutation passed by graphQL as prop
    - Updates the backend
    */
    await this.props.voteMutation({
      /*variables needed by the mutation for the vote*/
      variables: {
        linkId,
      },

      /*
      - Updates the cache
      - Notice that you’re already destructuring the server response and
      retrieving the vote field from it*/
      update: (store, { data: { vote } }) => {
        /*function recieved as prop from LinkList*/
        this.props.updateStoreAfterVote(store, vote, linkId)
      },
    })
  }
}

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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
`
/*You’re adding the ability to call the voteMutation to the Link component by
wrapping it with VOTE_MUTATION*/
export default graphql(VOTE_MUTATION, {
  name: 'voteMutation',
})(Link)
