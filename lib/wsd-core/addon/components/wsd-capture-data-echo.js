/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { computed } from '@ember/object';

import Component from '@ember/component';
import layout from '../templates/components/wsd-capture-data-echo';

export default Component.extend({
    layout,
    classNames: ['wsd-capture-data-echo'],

    rows: computed('dataStore.rows', function() {
        return this.get('dataStore.rows');
    }).readOnly(),
});
