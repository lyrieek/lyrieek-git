# lyrieek-git

lyrieek-git is a powerful visual tool for Git! Although Git can do a lot of work, but the work involved is much more difficult and error-prone. *lyrieek-git* makes this process incredibly easy and it changes the way developers work when they use it .

<img src="https://badgen.net/npm/v/lyrieek-git">
<img src="https://badgen.net/github/license/lyrieek/lyrieek-git">

![](https://repository-images.githubusercontent.com/333126168/4b914880-933e-11eb-9938-d49c502a34b1)

## Install
```
npm i lyrieek-git
```

## Project setup
First, you need to install Vue globally ahead of time
```
npm i @vue/cli -g
```
Then install node_modules
``` bash
npm i
cd server
npm i
```
Copy server/node_modules to build/node_module

### Making configuration files
create JSON customSetting/index.json

Configure any Git projects you use

### Config Format:
```
[
    {
        name: [custom name],
        projectPath: [absolute disk path],
        selected: [default select item],
        tag: [used to classify],
        languages: [programming language used],
        lang: [main human language used]
        ...
    },
    {projectPath: [other project path]}
    ...
]
```

### hot-reloads for development
``` cmd
npm run dev
cd server
npm run dev
```

### Use GPG
Suggest enable no-tty, set it in `gpg.conf` file

- If you're using GPG that comes with git-bash, The file path is `%USERPROFILE%\.gnupg\gpg.conf`
- If it is GPG4Win, its default directory is in `%USERPROFILE%\AppData\Roaming\gnupg\gpg.conf`

Open it, and write or append a line of text
```
no-tty
```

FRI
> https://gist.github.com/BoGnY/f9b1be6393234537c3e247f33e74094a

### About emoji

The library I'm using is
> https://github.com/carloscuesta/gitmoji

I'm looking at
> https://gist.github.com/parmentf/035de27d6ed1dce0b36a

## Compiles
``` cmd
npm run build
cd server
npm run build
cd ../dist
node index
```

## Announcements
- Only for Windows
- Any version of Internet Explorer is not supported
