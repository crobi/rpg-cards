/**
* Copyright (c) 2014, Facebook, Inc.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree. An additional grant
* of patent rights can be found in the PATENTS file in the same directory.
*
* @providesModule invariant
*/

// 2014-10-16 Dan Roberts: Minor adjustments for use as TypeScript with support for the option "Allow implicit 'any' types" to be disabled. The copyright message is maintained from the original file at https://github.com/facebook/flux/blob/master/src/invairant.js

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

module rpgcards {
    export function invariant(condition: boolean, format: string, a?: any, b?: any, c?: any, d?: any, e?: any, f?: any): void {
        if (!condition) {
            var error: Error;
            if (format === undefined) {
                error = new Error(
                    'Minified exception occurred; use the non-minified dev environment ' +
                    'for the full error message and additional helpful warnings.'
                    );
            } else {
                var args = [a, b, c, d, e, f];
                var argIndex = 0;
                error = new Error(
                    'Invariant Violation: ' +
                    format.replace(/%s/g, function () { return args[argIndex++]; })
                    );
            }

            (<any>error).framesToPop = 1; // we don't care about invariant's own frame
            throw error;
        }
    };
}
