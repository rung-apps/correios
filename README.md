### Rastreio de objetos nos correios

Vitor Emanuel Batista &lt;vitor.ebatista@gmail.com&gt;

[![Deploy to Rung](https://i.imgur.com/uijt57R.png)](https://app.rung.com.br/integration/correios/customize)

![rung-cli 0.4.1](https://img.shields.io/badge/rung--cli-0.4.1-blue.svg?style=flat-square)
![correios 0.2.2](https://img.shields.io/badge/correios-0.2.2-green.svg?style=flat-square)

Rastreie objetos postados nos correios e seja alertado de mudanças no histórico da postagem

#### Parameters

|Parameter | Type | Description |
|----------|------|-------------|
| `track` | `String` | Informe o código de rastreamento (EX AA123456789BR) |
| `item` | `String` | Você poderia me dar uma breve descrição do item? (EX Guarda-Roupa) |

<img align="left" width="256" src="./icon.png" />

##### Dependencies

- `ramda`: `^0.23.0`
- `rung-sdk`: `^1.0.7`
- `tracking-correios`: `^1.1.0`
