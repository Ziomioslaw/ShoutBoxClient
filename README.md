ShoutBoxClient
==============

# Description

Java Script client shoutbox.

# Required

* jQuery 2.1.3
* [jQuery Cookie Plugin v1.4.1](https://github.com/carhartl/jquery-cookie)  (for Cookie Storage)
* jQuery Favicon Notify ... with unknown origin...

# Install:

Add into HTML code: `new ShoutBox.ShoutBox()`. Parameters:

 * 1st: Link into index.php of SMF forum
 * 2sd: Member display nick
 * 3rd: Member ID
 * 4th: Session key
 * 5th: Additional parameters as object

# Project structure

 * File: **core.js** main file of project.
 * Directory: **actions** for "Before Submit" actions.
 * Directory: **features** for additional features.
 * Directory: **view** for shoutbox view layer.

# Adding feature:

Add function into `ShoutBox.AdditionalFeatureManager`.
 * First parameter: feature name (used also as option name)
 * Second parameter: feature itself
 * Third parameter: default option value. `True` means, that feature will be active by default
