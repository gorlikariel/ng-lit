/* eslint-disable no-prototype-builtins,no-restricted-syntax,no-param-reassign */
import { get } from "lodash-es";
import { watchIfNeeded } from "./watchers";

const SECOND = 1000;

/**
 * @param {LitElement} baseElement - the LitElement to extend
 */
export const NgLit = baseElement => {
    return class extends baseElement {

        /**
         * Extend the LitElement `createProperty` to override ngProp's type into String
         */
        static createProperty(name, options) {
            if (this.ngProps[name]) {
                options = options || {};
                options.type = String;
            }
            super.createProperty(name, options);
        }


        /**
         * Extend the LitElement `update` to check for changed properties and inject angular properties from scope if possible
         */
        update(changedProps) {
            if (this.__shouldUpdateNgProps(changedProps)) {
                this.__updateWithoutNgScopeSync(changedProps);
                (async () => {
                    const ngScope = await this.__getNgScope();
                    this.__updateWithNgScopeAsync(ngScope, changedProps);
                })();
            } else {
                super.update(changedProps);
            }
        }

        /**
         *
         * INTERNAL METHODS
         *
         */


        /**
         * Check if a given prop name is an angular prop
         * @param propName
         * @returns {*|boolean}
         * @private
         */

        __isNgProp(propName) {
            return this.constructor.ngProps[propName];
        }

        /**
         * Return true if we should update angular properties
         * @returns {boolean}
         * @private
         */
        __shouldUpdateNgProps(changedProps) {
            if (!this.constructor.ngProps) {
                return false;
            }
            for (const changedPropKey of changedProps.keys()) {
                if (this.__isNgProp(changedPropKey)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Return a promise that is resolved with angular's parent scope
         * @returns {Promise<any>}
         * @private
         */
        __getNgScope() {
            return new Promise((resolve) => {
                const { angular } = window;
                if (this.__ngScope) {
                    resolve(this.__ngScope);
                }
                let ngScope = angular ? angular.element(this.parentElement).scope() : null;
                if (ngScope) {
                    this.__ngScope = ngScope;
                    resolve(this.__ngScope);
                } else {
                    setTimeout(async () => {
                        ngScope = angular ? angular.element(this.parentElement).scope() : null;
                        if (ngScope) {
                            this.__ngScope = ngScope;
                            // Try to extract angular's $apply, otherwise use setTimeout
                            const $body = angular ? angular.element(
                              document.getElementsByTagName('ng-app')[0] ||
                              document.querySelector("[ng-app]")
                            ) : null;
                            const nextDigest = get($body, 'scope().$root.$apply') || setTimeout;
                            nextDigest(() => {
                                resolve(this.__ngScope);
                            });
                        } else {
                            console.warn(`Angular scope want not found on ${this.constructor.name}`);
                            resolve();
                        }
                    }, SECOND * 0.1);
                }
            });
        }


        /**
         * Commit an update before we have the scope
         * @param ngScope
         * @param changedProps
         * @private
         */
        __updateWithoutNgScopeSync(changedProps) {
            for (const [ngPropName, ngPropOptions] of Object.entries(this.constructor.ngProps)) {
                const ngLitValue = changedProps.get(ngPropName);
                if ((!ngLitValue || typeof ngLitValue === 'string') && ngPropOptions.default) {
                    // apply default if any
                    this[ngPropName] = ngPropOptions.default;
                }
            }
            super.update(changedProps);
        }


        /**
         * Commit an update with the scope and the changedProp
         * @param ngScope
         * @param changedProps
         * @private
         */
        __updateWithNgScopeAsync(ngScope, changedProps) {
            for (const [ngPropName, ngPropOptions] of Object.entries(this.constructor.ngProps)) {
                const pathOnScope = this.getAttribute(ngPropName);
                const ngValueOnScope = get(ngScope, pathOnScope);
                if (!ngValueOnScope || typeof ngValueOnScope === 'string') {
                    // apply default if any
                    const ngLitValue = changedProps.get(ngPropName);
                    if (!ngLitValue || typeof ngLitValue === 'string') {
                        // apply default if any
                        if (ngPropOptions.default) {
                            this[ngPropName] = ngPropOptions.default;
                            changedProps.set(ngPropName, ngPropOptions.default);
                        } else {
                        // else delete it
                            this[ngPropName] = null;
                            changedProps.delete(ngPropName);
                        }
                    }
                } else {
                    watchIfNeeded(ngPropOptions, this, ngScope, ngValueOnScope);
                    this[ngPropName] = ngValueOnScope;
                    changedProps.set(ngPropName, ngValueOnScope);
                }
            }
            super.update(changedProps);
        }
    };
};

export default NgLit;
