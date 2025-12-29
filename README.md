# Trello Desktop

> Unofficial Trello Desktop snap package for Linux

## Install

To add a shortcut to the app, create a file in `~/.local/share/applications` called `trello` with the following contents:

```
[Desktop Entry]
Name=Trello
Exec=/full/path/to/folder/Trello
Terminal=false
Type=Application
Icon=/full/path/to/folder/Trello/resources/app/static/Icon.png
```
## Dev

Built with [Electron](http://electron.atom.io).

###### Commands

- Init: `$ npm install`
- Run: `$ npm start`
- Build Linux: `$ npm run build`

## License

Apache-2 @ [Taylor Evanson](https://linkedin.com/in/taypme)
