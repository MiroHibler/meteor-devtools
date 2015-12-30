## Meteor debugging with Chrome DevTools

A Meteor Package paired with Chrome DevTools Extension for debugging a Meteor app.

Currently supporting only Blaze.

> *NOTE:* This is very WIP (work in progress) - there are a lot of bugs and TODOs!

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MiroHibler/meteor-devtools.git
```

2. Visit chrome://extensions in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox: ![The menu's icon is three horizontal bars.](https://developer.chrome.com/static/images/hotdogmenu.png) and select Extensions under the Tools menu to get to the same place).

3. Ensure that the `Developer mode` checkbox in the top right-hand corner is checked.

4. Click `Load unpacked extension…` to pop up a file-selection dialog.

5. Navigate to the directory where you cloned the repository, navigate to `chrome` directiory, and select it.

Alternatively, you can drag and drop the `chrome` directory where your extension files live onto chrome://extensions in your browser to load it.

## Usage

1. Add the package to your Meteor app:

```bash
meteor add miro:devtools
```
> *NOTE:* To be able to see full data, you need to install `insecure` and `autopublish` packages as well!

2. Go to Chrome and open DevTools.

3. There will be a new panel: `Meteor`.

4. Enjoy! ;)

![Meteor DevTools Demo](https://raw.github.com/MiroHibler/meteor-devtools/master/chrome/quick_demo.gif)

## Version Info

#### v0.0.1
 - Initial version

## Copyright and license

Copyright © 2015 [Miroslav Hibler](http://miro.hibler.me)

_miro:devtools_ is licensed under the [**MIT**](http://miro.mit-license.org) license.
