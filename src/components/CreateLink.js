import React, { Component } from 'react'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { FEED_QUERY } from './LinkList'

import { LINKS_PER_PAGE } from '../constants'

class CreateLink extends Component {
  state = {
    description: '',
    url: '',
  }

  render() {
    return (
      <div>
        <div className="flex flex-column mt3">

          {/*Input for the description of the Link*/}
          <input
            className="mb2"
            value={this.state.description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />

          {/*Input for the name of the Link*/}
          <input
            className="mb2"
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>

        {/*when the button is clicked, call the createLink function*/}
        <button onClick={() => this._createLink()}>Submit</button>
      </div>
    )
  }

  //_createLink mutation:
  _createLink = async () => {

    //pass the state to my variables
    const { description, url } = this.state
    /*Call the mutation, that creates the Link in the backend*/
    await this.props.postMutation({
      /*the variables that the mutation needs to create the Link*/
      variables: {
        description,
        url,
      },

      /*update function:
      - write methods:
        - These methods allow you to update the data in your local cache, to
        simulate an update from the server
        - these updates are not actually persisted to your backend
        - they allow you to exactly modify the data in your cache to make sure
        it is in sync with the server in cases where you do not want to do a
        full server refetch
        - Or, in cases where you want to slightly modify some data on the
        client so that the user may have a better experience.

      - Update function:
        - Provided by Apollo Client
        - for cache updating
        - Passes in a "store" object (cache itself?) with the four read and write methods
        (readQuery, writeQuery, readFragment, writeFragment), which allows to
        update the cache in whichever way you choose...this methods are provided
        precisely to control the store
        - Added as argument to the mutation
        - Invocated directly after the server returns the response
        - It receives the payload of the mutation (data) and the current cache (store) as arguments*/
      update: (store, { data: { post } }) => {
          const first = LINKS_PER_PAGE
          const skip = 0
          const orderBy = 'createdAt_DESC'


          /*read the current state of the results of the FEED_QUERY..the store is
          the cache...FEED_QUERY comes from LinkList.js
          - readQuery():
            - reads data ONLY from cache (starting at your root query type)
            - you provide it the query you want to read as a named argument
            - if the data exists in your cache then it will be returned and you may
            interact with the data object however you like
            - if not => error
            - you may also pass in variables*/
          const data = store.readQuery({
            query: FEED_QUERY,
            variables: { first, skip, orderBy },
          })
          /*insert the newest link at index 0*/
          data.feed.links.splice(0, 0, post)
          data.feed.links.pop()

          /*write the query results back to the store
          - writeQuery():
            - You provide the query and an argument called "data"
            - The data object must be in the same shape as the JSON result your
            server would return for this query
            - data is the data that the query has to use?*/
          store.writeQuery({
            query: FEED_QUERY,
            data,
            variables: { first, skip, orderBy },
          })
        },
      })
      /*
      After the mutation was performed, react-router-dom will now navigate back to
      the LinkList component that’s accessible on the root route: /
      */
      this.props.history.push(`/new/1`)
    }
}
/*1
You first create the JavaScript constant called POST_MUTATION that stores the
mutation
*/
const POST_MUTATION = gql`
  # 2
  # Now you define the actual GraphQL mutation. It takes two arguments, url and
  # description, that you’ll have to provide when invoking the mutation

  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`

/*3
Lastly, you’re using the graphql container to combine the CreateLink component
with the POST_MUTATION. The specified name again refers to the name of the prop
that’s injected into CreateLink. This time, a function will be injected that’s
called postMutation and that you can invoke and pass in the required arguments
*/
export default graphql(POST_MUTATION, { name: 'postMutation' })(CreateLink)
