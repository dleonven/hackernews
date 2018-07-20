import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'

import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

class Login extends Component {
  state = {
    /*
    login: true for users that already have an account
    */
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: '',
  }

  render() {
    return (
      <div>
        <h4 className="mv3">{this.state.login ? 'Login' : 'Sign Up'}</h4>
        <div className="flex flex-column">

          {/*
if it login is false (sign up case), then ask for the name
            */}
          {!this.state.login && (
            <input
              value={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              placeholder="Your name"
            />
          )}

          {/*
in both cases you ask for email and password
            */}
          <input
            value={this.state.email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
            placeholder="Your email address"
          />
          <input
            value={this.state.password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            placeholder="Choose a safe password"
          />
        </div>
        <div className="flex mt3">
          <div className="pointer mr2 button" onClick={() => this._confirm()}>
            {this.state.login ? 'login' : 'create account'}
          </div>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !this.state.login })}
          >
            {this.state.login
              ? 'need to create an account?'
              : 'already have an account?'}
          </div>
        </div>
      </div>
    )
  }

  /*
The method _confirm will be used to implement the mutations that we need to
send for the login functionality

. . .
  */
  _confirm = async () => {
  const { name, email, password } = this.state

  /*
  If the user wants to just login, you’re calling the loginMutation and pass the
  provided email and password as arguments
  */
  if (this.state.login) {
    const result = await this.props.loginMutation({
      variables: {
        email,
        password,
      },
    })
    const { token } = result.data.login
    this._saveUserData(token)
  } else {

    /*
    Otherwise you’re using the signupMutation where you additionally pass the
    user’s name
    */

    const result = await this.props.signupMutation({
      variables: {
        name,
        email,
        password,
      },
    })

    /*
    After the mutation was performed, you’re storing the returned token in
    localStorage and navigate back to the root route
    */
    const { token } = result.data.signup
    this._saveUserData(token)
  }
  this.props.history.push(`/`)
}

  _saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token)
  }
}

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`

/*
Note that you’re using compose for the export statement this time since there
is more than one mutation that you want to wrap the component with.
*/
export default compose(
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
  graphql(LOGIN_MUTATION, { name: 'loginMutation' }),
)(Login)
