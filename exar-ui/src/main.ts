import 'bootstrap';
import 'bootstrap-datetimepicker';
import 'emailjs-tcp-socket';
import 'moment';

import {Aurelia} from 'aurelia-framework';

export function configure(aurelia: Aurelia) {
    aurelia.use
        .standardConfiguration()
        .developmentLogging()
        .plugin('aurelia-animator-css')
        .plugin('aurelia-dialog', config => {
            config.useDefaults();
            config.settings.lock = false;
        })
        .globalResources([
			'converters/date-format',
            'converters/obfuscate',
            'converters/upper'
		]);

    aurelia.start().then(() => aurelia.setRoot());
}
