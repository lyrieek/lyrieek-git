# lyrieek-git

lyrieek-git is a powerful visual tool for Git! Although Git can do a lot of work, but the work involved is much more difficult and error-prone. *lyrieek-git* makes this process incredibly easy and it changes the way developers work when they use it .

## Project setup
``` bash
yarn install
cd server
yran install
```

create JSON customSetting/index.json

format:
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

### Use GPG
Suggest enable no-tty, set it in `gpg.conf` file

- If you're using GPG that comes with git-bash, The file path is `%USERPROFILE%\.gnupg\gpg.conf`
- If it is GPG4Win, its default directory is in `%USERPROFILE%\AppData\Roaming\gnupg\gpg.conf`

Open it, and write or append a line of text
```
no-tty
```

### Compiles and hot-reloads for development
```
yarn run dev
```

### Compiles and minifies for production
```
yarn run build
```

## Announcements
- Only for Windows
- Any version of Internet Explorer is not supported
