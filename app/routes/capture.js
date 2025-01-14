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

import { isEmpty, isNone } from '@ember/utils';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    queryParams: {
        drilldownInfoParam: { refreshModel: true },
        metricTimelinesParam: { refreshModel: true },
        timeFrom: { refreshModel: true },
        timeTo: { refreshModel: true },
    },

    captureTimelines: service('capture-timelines'),
    dataSearchService: service('data-search'),
    userTracking: service('user-tracking'),

    model(params) {
        return new CaptureModel(
            params.filePath,
            {
                drilldownInfoParam: params.drilldownInfoParam,
                metricTimelinesParam: params.metricTimelinesParam,
                timeFrom: params.timeFrom,
                timeTo: params.timeTo,
            }
        );
    },

    setupController(controller, model) {
        this._super(controller, model);

        this.captureTimelines.setCurrent(
            this.captureTimelines.deserializeFromQueryParam(model.queryParams.metricTimelinesParam)
        );
    },

    deactivate() {
        document.title = 'Sysdig Inspect';
    },

    getCurrentQueryParams(overrides) {
        return Object.assign(
            {},
            this.get('controller.model.queryParams'),
            {
                filter: this.get('controller.filter'),
                searchPattern: this.get('dataSearchService.searchDataStore.searchPattern'),
            },
            overrides
        );
    },

    actions: {
        select(drilldownInfo) {
            console.debug('route:application.capture', 'select', ...arguments);
            this.replaceWith('capture.views.view', drilldownInfo.viewId, {
                queryParams: this.getCurrentQueryParams({
                    drilldownInfoParam: drilldownInfo.drilldownInfoParam,
                }),
            });
        },

        drillDown(drilldownInfo) {
            console.debug('route:application.capture', 'drillDown', ...arguments);
            this.transitionTo('capture.views.view', drilldownInfo.viewId, {
                queryParams: this.getCurrentQueryParams({
                    drilldownInfoParam: drilldownInfo.drilldownInfoParam,
                }),
            });
        },

        applyFilter(filter) {
            this.userTracking.action(this.userTracking.ACTIONS.INTERACTION, {
                name: 'apply sysdig filter',
                'is set': isEmpty(filter) === false,
            });

            console.debug('route:application.capture', 'applyFilter', ...arguments);
            this.transitionTo('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    filter: isEmpty(filter) ? undefined : filter,
                }),
            });
        },

        applySearch(searchPattern) {
            console.debug('route:application.capture', 'applySearch', ...arguments);
            this.transitionTo('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    searchPattern: isEmpty(searchPattern) ? undefined : searchPattern,
                }),
            });
        },

        selectTimeWindow(from, to) {
            if (isNone(from) === false && isNone(to) === false) {
                this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                    queryParams: this.getCurrentQueryParams({
                        timeFrom: from,
                        timeTo: to,
                    }),
                });
            } else {
                this.userTracking.action(this.userTracking.ACTIONS.INTERACTION, {
                    name: 'reset timeline selection',
                });

                this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                    queryParams: this.getCurrentQueryParams({
                        timeFrom: undefined,
                        timeTo: undefined,
                    }),
                });
            }
        },

        toggleMetricTimeline(metricName) {
            this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    metricTimelinesParam: this.captureTimelines.serializeToQueryParam(
                        this.captureTimelines.toggle(metricName)
                    ),
                }),
            });
        },

        removeMetricTimeline(metricName) {
            this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    metricTimelinesParam: this.captureTimelines.serializeToQueryParam(
                        this.captureTimelines.remove(metricName)
                    ),
                }),
            });
        },
    },
});

class CaptureModel {
    constructor(filePath, queryParams) {
        this.filePath = filePath;
        this.queryParams = queryParams;
    }
}
