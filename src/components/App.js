import React, { Component } from 'react'
import LinkList from './LinkList'
import CreateLink from './CreateLink'

import Header from './Header'
import { Switch, Route, Redirect } from 'react-router-dom'

import Login from './Login'
import Search from './Search'



class App extends Component {

  render() {
    return (
      <div className='center w85'>
        <Header />
        <div className='ph3 pv1 background-gray'>
          <Switch>
          {/*
          - http://localhost:3000/ will render LinkList (parent route)
          - The LinkList component will be used for two different use cases (and routes).
            - The first one is to display the 10 top voted links.
            - Its second use case is to display new links in a list separated into
            multiple pages that the user can navigate through

          - You now added two new routes: /top and /new/:page. The latter reads the value for page from the url so that this information is available inside the component that’s rendered, here that’s LinkList.
          */}

            {/*
            The root route / now redirects to the first page of the route where
            new posts are displayed
            */}
            <Route exact path='/' render={() => <Redirect to='/new/1' />} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/create' component={CreateLink} />
            <Route exact path='/search' component={Search} />
            <Route exact path='/top' component={LinkList} />
            {/*
            new/1 ==> first page of the new links list, and so on
            */}
            <Route exact path='/new/:page' component={LinkList} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App
