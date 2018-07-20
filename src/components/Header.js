/*
This simply renders two Link components that users can use to navigate between
the LinkList and the CreateLink components
*/

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'

// import the key definition from constants.js
import { AUTH_TOKEN } from '../constants'

/*
You first retrieve the authToken from local storage. If the authToken is not
available, the submit-button won’t be rendered any more. That way you make sure
only authenticated users can create new links.

You’re also adding a second button to the right of the Header that users can
use to login and logout
*/


class Header extends Component {
  render() {

  //first retrieve the authToken from local storage
  const authToken = localStorage.getItem(AUTH_TOKEN)
  return (
    <div className="flex pa1 justify-between nowrap orange">
      <div className="flex flex-fixed black">
        <div className="fw7 mr1">Hacker News</div>

        {/*
          - Navigation item that brings the user to the / route
          - In App.js, this is redirected to /new
        */}
        <Link to="/" className="ml1 no-underline black">
          new
        </Link>
        <div className="ml1">|</div>


        {/*Navigation item that brings the user to the /top route*/}
        <Link to="/top" className="ml1 no-underline black">
          top
        </Link>
        <div className="ml1">|</div>

        {/*Navigation item that brings the user to the /search route*/}
        <Link to="/search" className="ml1 no-underline black">
          search
        </Link>

        {/*
If the authToken is available, render the submit button (vice-versa)
That way you make sure only authenticated users can create new links
          */}
        {authToken && (
          <div className="flex">
            <div className="ml1">|</div>
            <Link to="/create" className="ml1 no-underline black">
              submit
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-fixed">
        {authToken ? (
          <div
            className="ml1 pointer black"
            onClick={() => {
              localStorage.removeItem(AUTH_TOKEN)
              this.props.history.push(`/`)
            }}
          >
            logout
          </div>
        ) : (
          <Link to="/login" className="ml1 no-underline black">
            login
          </Link>
        )}
      </div>
    </div>
  )
}
}

export default withRouter(Header)
