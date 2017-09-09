ShoutBoxClient
==============

# Description

Java Script client shoutbox.

# Required

* jQuery 2.1.3
* [jQuery Cookie Plugin v1.4.1](https://github.com/carhartl/jquery-cookie)  (for Cookie Storage)
* jQuery Favicon Notify ... with unknown origin...

# Starting developing

 * `npm install`
 * for first build: `grunt`
 * for deploy: `grunt upload`
 * fonts are uploaded only on demand: `grunt upload fonts`

# Server.json

The JSON file containing data to needed upload the data.

```json
{
    "host": "ssh host",
    "username": "ssh username",
    "password": "ssh password",
    "path": "absolute path to place, where code should be uploaded"
}
```

# Install on webpage

Add into HTML code: `new ShoutBox.ShoutBox()`. Parameters:

 * 1st: Link into index.php of SMF forum
 * 2sd: Member display nick
 * 3rd: Member ID
 * 4th: Session key
 * 5th: Link to the server part of ShoutBox
 * 6th: Additional parameters as object

# Project structure

 * Directory: **core** main files of project.
 * Directory: **actions** for "Before Submit" actions.
 * Directory: **features** for additional features.
 * Directory: **view** for shoutbox view layer.

# Adding feature:

Add function into `ShoutBox.AdditionalFeatureManager`.
 * First parameter: feature name (used also as option name)
 * Second parameter: feature itself
 * Third parameter: default option value. `True` means, that feature will be active by default
