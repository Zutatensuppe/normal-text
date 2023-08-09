# normal-text

A library to remove accents and convert 'aesthetic' text into normal text.

## Installation

```console
npm i @zutatensuppe/normal-text
```

## Usage

```js
import normalText from '@zutatensuppe/normal-text'

// Examples
// -------------------------------------------------------------------
const text = normalText.normalize('𝕥𝕙𝕚𝕤 𝕚𝕤 𝕒𝕖𝕤𝕥𝕙𝕖𝕥𝕚𝕔') // 'this is aesthetic'
const text = normalText.normalize('INｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ') // 'INternationalizati0n'
```
