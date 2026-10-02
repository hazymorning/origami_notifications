# Origami Notifications

A Home Assistant card for everything that wants your attention. Closed, it is one line with the newest item. Open, it lists them all.

![The card closed on a phone and open next to it](https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/dark-and-light-preview.png)

System notifications, repairs and pending updates come in without any setup. Anything else you add becomes a notification too: a door left open, the event running in a calendar, an alarm going off, a weather warning, a sensor with a picture and a text in its attributes. Rows can carry buttons for any action, each source can be kept to certain people, and the whole card takes your own CSS.

Install it with HACS: add `https://github.com/hazymorning/origami_notifications` as a custom repository of type Dashboard, then pick the card in the dashboard editor. Most of what follows can be set there as well.

<details>
<summary>What can be a notification</summary>

```yaml
type: custom:origami-notifications
entities:
  - binary_sensor.garage_door     # while it is on
  - calendar.family               # the event that is running
  - entity: sensor.washer
    type: generic                 # any state except off, idle, 0 and the like
  - entity: sensor.library
    attribute: next_due           # title, text and picture from this attribute
    background: true              # its picture blurred behind the card while on top
label: notify                     # plus every entity with this label
updates: true                     # default
repairs: true                     # default, admins only
hide_when_empty: true             # default
```

Without a `type` the card looks at each entity itself. Calendars show their running event, updates get an install button if the integration can install, alarm panels show while triggered, pending or arming, alerts while on, DWD weather warnings as one row per warning. An attribute holding an object with a `name` or `title` is found on its own and gives the row its title, `description` and `image`. `attribute` names one, or a path into one, and a plain value there becomes the title. `type: picture` puts the state in the title, for a sensor whose state is the thing itself. Everything else shows while it is `on`, `active` or a number above zero.

Per entity there are also `name`, `icon`, `image` (an attribute, a path or a URL), `tap_action` and `actions`.

</details>

<details>
<summary>Buttons and taps</summary>

```yaml
entities:
  - entity: binary_sensor.doorbell
    tap_action:
      action: navigate
      navigation_path: /lovelace/cameras
    actions:
      - label: Open the door
        tap_action:
          action: perform-action
          perform_action: lock.open
          target:
            entity_id: lock.front_door
```

Actions work like in any other card. Without a `tap_action` a row opens its entity. A system notification follows its first link, a repair opens the repairs page. Rows with more text than fits open up on a tap.

</details>

<details>
<summary>Who sees what</summary>

```yaml
audience:
  system:
    only: [person.anna]
  sensor.dwd_weather_warnings:
    except: [person.kid]
```

Keys are `system`, `updates`, `repairs` or an entity id. People are matched through the user linked to them under Settings, People. While the dashboard is being edited, everyone sees everything.

</details>

<details>
<summary>Your own CSS</summary>

`css` goes into the card as a stylesheet, after its own, so any part of it can change.

```yaml
css: |
  :host { --origami-radius: 20px; --origami-pad: 16px; }
  .row { border: 1px solid var(--divider-color); }
  .clear { color: var(--error-color); }
```

Variables: `--origami-pad`, `--origami-gap`, `--origami-gap-s`, `--origami-radius`, `--origami-radius-s`, `--origami-tile`, `--origami-tile-s`, `--origami-icon`, `--origami-muted`, `--origami-quiet`, `--origami-ease`, `--origami-time`, `--origami-focus`, `--origami-max-height`, `--origami-bg-opacity` and `--origami-bg-blur` (the last two also in a theme).

Classes: `.head`, `.tile`, `.badge`, `.title`, `.msg`, `.ebar`, `.count`, `.list`, `.row`, `.rtile`, `.body`, `.when`, `.x`, `.act`, `.foot`, `.clear`, `.backdrop`.

</details>

<details>
<summary>Dismissing</summary>

System notifications, updates and repairs are dismissed in Home Assistant: the notification is gone for everyone, the update skipped, the repair ignored. Everything else is only hidden on the device you are on and comes back once it says something new. Alarm panels can't be dismissed and stay until the panel moves on.

</details>

<details>
<summary>Layout and language</summary>

The card is as high as its content and hides itself when there is nothing to show. With a fixed height from the layout tab, or in the footer of a sections view, the open list scrolls inside it.

Texts follow the language of your profile. English and German are built in, other languages get Home Assistant's own words where it has them, and English otherwise. Times follow the 12 or 24 hour setting.

</details>

<details>
<summary>Without HACS</summary>

Copy `dist/origami-notifications.js` to `config/www/` and add it as a dashboard resource:

```yaml
url: /local/origami-notifications.js
type: module
```

</details>
