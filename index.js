import { create } from 'rung-sdk';
import { String as Text } from 'rung-sdk/dist/types';
import TrackingCorreios from 'tracking-correios';
import { map, mergeAll, join } from 'ramda';

function createAlert(info, item, updating) {
    const title = item === '' ? info.numero : `${item}, ${info.numero}`;
    return {
        [info.numero]: {
            title: capitalize(title),
            content: renderContent(info, item),
            comment: renderComment(info, title, updating)
        }
    };
}

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function renderContent(info, item) {
    const string = item === '' ? info.numero : item;
    return `${capitalize(string)} com status "${info.evento[0].descricao}" em ${info.evento[0].cidade}/${info.evento[0].uf}`;
}

function renderEvent(name, title, description, date, time, city, state) {
    return `${name}, ${title} com status "${description}" em ${date} às ${time} na cidade de ${city}/${state}`;
}

function renderComment(info, title, updating) {
    return updating
        ? renderEvent(info.nome, title, info.evento[0].descricao, info.evento[0].data, info.evento[0].hora, info.evento[0].cidade, info.evento[0].uf)
        : join(' \n', map(event => renderEvent(info.nome, title, event.descricao, event.data, event.hora, event.cidade, event.uf), info.evento));
}

function main(context, done) {
    const { track, item } = context.params;
    const { db } = context;
    const updating = db !== undefined;

    return TrackingCorreios
        .track(track)
        .then(body => {
            const alerts = mergeAll(map(info => createAlert(info, item, updating), body));
            done({
                alerts,
                db: { updating: true }
            });
        })
        .catch(() => done({ alerts: {}, db }));
}

const params = {
    track: {
        description: 'Informe o código de rastreamento (EX AA123456789BR)',
        type: Text,
        default: ''
    },
    item: {
        description: 'Você poderia me dar uma breve descrição do item? (EX Guarda-Roupa)',
        type: Text,
        default: ''
    }
};

export default create(main, { params, primaryKey: true });
