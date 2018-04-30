import { create } from 'rung-sdk';
import { String as Text } from 'rung-sdk/dist/types';
import { reject } from 'bluebird';
import TrackingCorreios from 'tracking-correios';
import {
    adjust,
    head,
    find,
    has,
    isEmpty,
    join,
    last,
    map,
    mergeAll,
    pipe,
    toUpper,
    unless
} from 'ramda';
import moment from 'moment';

const capitalize = unless(isEmpty, pipe(adjust(toUpper, 0), join('')));

function softBody(lastEvent) {
    const deliveredToTarget = lastEvent.descricao === 'Objeto entregue ao destinatário';
    const daysFromNow = Math.abs(moment(`${lastEvent.data} ${lastEvent.hora}`, 'DD/MM/YYYY hh:mm')
        .diff(new Date(), 'days'));

    return daysFromNow >= 3 && !deliveredToTarget;
}

function createAlert(info, description) {
    const doingSoftBody = softBody(head(info.evento));
    const title = description.trim() === '' ? info.numero : `${description}, ${info.numero}`;

    return {
        [info.numero]: {
            title: capitalize(title),
            content: render(info, description),
            comment: renderComment(info, title),
            resources: renderSoftBody(doingSoftBody)
        }
    };
}

function renderSoftBody(softBody) {
    return softBody
        ? ['https://i.imgur.com/goHE63x.jpg']
        : [];
}

function render(info, description) {
    const name = capitalize(description === '' ? info.numero : description);
    const [event] = info.evento;

    return _('{{name}} with status "{{description}}" in the city of {{city}}/{{state}}', {
        name,
        description: event.descricao,
        city: event.cidade,
        state: event.uf
    });
}

function renderComment(info, title) {
    const lastEvent = last(info.evento);

    return _('{{name}}, {{title}} with status "{{description}}" in {{date}} at {{time}} in the city of {{city}}/{{state}}', {
        title,
        name: info.nome,
        description: lastEvent.descricao,
        date: lastEvent.data,
        time: lastEvent.hora,
        city: lastEvent.cidade,
        state: lastEvent.uf
    });
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}

class InvalidCodeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidCodeError';
    }
}

function main(context) {
    const { code, description } = context.params;

    return TrackingCorreios
        .track(code)
        .then(body => {
            const error = find(has('erro'), body);

            if (error) {
                return reject(new NotFoundError(_('Object not found in the Correios database')));
            }

            const alerts = mergeAll(map(info => createAlert(info, description), body));

            return ({ alerts });
        })
        .catch({ name: 'TrackingError' }, err => err.type === 'validation_error'
            ? reject(new InvalidCodeError(_('Invalid tracking code')))
            : reject());
}

const params = {
    code: {
        description: _('Enter the tracking code (Ex: AA123456789BR)'),
        type: Text,
        required: true
    },
    description: {
        description: _('Could you give me a brief description of the item? (Ex: Wardrobe)'),
        type: Text,
        default: ''
    }
};

export default create(main, {
    params,
    primaryKey: true,
    title: _('Tracking objects on Correios'),
    description: _('Be informed about every move of your order and be aware of possible delivery problems.'),
    preview: render({
        numero: 'PL610951449BR',
        evento: [{
            descricao: 'Objeto entregue ao destinatário',
            cidade: 'São Paulo',
            uf: 'SP'
        }] }, 'Bicicleta')
});
