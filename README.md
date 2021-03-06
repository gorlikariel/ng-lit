### :warning: Under development :hammer_and_wrench:

# Pass objects and arrays from AngularJS scope to LitElement
[![CircleCI](https://circleci.com/gh/oriweingart/ng-lit.svg?style=svg)](https://circleci.com/gh/oriweingart/ng-lit)
[![NPM version](https://badge.fury.io/js/ng-lit.svg)](https://travis-ci.com/oriweingart/ng-lit)


Mixing class to pass angular objects and arrays from [AngularJS](https://github.com/angular/angular.js) application into [lit-element](https://github.com/Polymer/lit-element) without parsing them as json.

## Install

```bash
npm i -S ng-lit
```


## Simple usage

[Demo on jsfiddle](https://jsfiddle.net/ozbjm9wv/5/)

```javascript
// lit component
import { LitElement, html } from "lit-element";
import { NgLit } from "ng-lit";

class NgLitUser extends NgLit(LitElement) {
  static get properties() {
    return {
      age: { type: Number },
      user: { type: Object }
    };
  }
  // declare the angular props
  static get ngProps() {
    return {
      user: { default: {} }
    }
  }
  render() {
    const { age, user } = this;
    return html`<span>${user.firstName} ${user.lastName} is ${age} years old</span>`;
  }
}
customElements.define('ng-lit-user', NgLitUser);
```

```html
<!-- angular -->
<div ng-app="myApp" 
     ng-controller="myCtrl">
    <ng-lit-user 
       user="ngUser" 
       age="15">
    </ng-lit-user>
</div>
<script>
  angular.module('myApp', [])
    .controller('myCtrl', $scope => {
        $scope.ngUser = {
          firstName: "John",
          lastName: "Doe"
        };
  });
</script>
```

## Properties

Props that need to be extracted from angular should be to be added to `ngProps` method.

The following example will fetch `books` list and `selectedBook` object from angular while `userId` will be treated as normal litElement property:
```javascript
  static get properties() {
    return {
      userId: { type: Number },
      books: { type: Array }, 
      selectedBook: { type: Object }
    };
  }
  static get ngProps() {
    return {
      books: { default: [] },
      selectedBook: { default: {} }
    }
  }
```

#### Defaults
use the `default` option to pass a default value in case of angular scope or the value were not found (or `null`).
```javascript
  static get ngProps() {
    return {
      selectedBook: { default: {title: '1984', author: 'George Orwell'} }
    }
  }
```

#### Watch
use the `watch: true` option to make litElement re-render on changes made to the property on angular's code.

The following example will re-render the litElement when `$scope.addBook()` is called:

```javascript
// lit component
class NgListBookList extends NgLit(LitElement) {
  static get properties() {
    return {
      books: { type: Array }
    };
  }
  static get ngProps() {
    return {
      books: { default: [], watch: true }
    }
  }
  render() {
    const { books } = this;
    return html`${books.map(({title, author}) =>html`<li>${title} by ${author}</li>`)}`;
  }
}
customElements.define('ng-lit-books', NgListBookList);
```

```html
<!-- angular -->
<div ng-app="myApp" 
     ng-controller="myCtrl">
    <ng-lit-books 
       books="myBooks">
    </ng-lit-books>
    <button 
        ng-click="addBook({title: 'Anna Karenina', author: 'Leo Tolstoy'})">
        Anna Karenina
    </button>
</div>
<script>
  angular.module('myApp', [])
    .controller('myCtrl', $scope => {
        $scope.myBooks = [];
        $scope.addBook = book => {
            $scope.myBooks.push(book)  
        }
  });
</script>
```
