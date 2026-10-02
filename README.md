# Origami Notifications

A Home Assistant card for everything that wants your attention. Closed, it is one line with the newest or most urgent item. Open, it lists them all.

![The card closed on a phone and open next to it](https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/dark-and-light-preview.png)

System notifications, repairs and pending updates come in without any setup. Any entity you add, or every entity with a label, becomes a notification too: a door left open, the event running in a calendar, an alarm going off, a weather warning, or what a sensor's attributes describe, like a parcel on its way. Pictures show in the row and, if you want, blurred behind the whole card. Rows can carry buttons for any action, each source can be limited to certain people, and the card takes your own CSS.

Install it with HACS: add `https://github.com/hazymorning/origami_notifications` as a custom repository of type Dashboard and download it. Most of what follows can also be set in the visual editor.

<details>
<summary>What can be a notification</summary>

```yaml
type: custom:origami-notifications
entities:
  - binary_sensor.garage_door     # while it is on
  - calendar.family               # the event that is running
  - entity: sensor.washer
    type: generic                 # any state but off, idle, none, 0, unknown, unavailable
  - entity: sensor.library
    attribute: next_due           # title, text and picture from this attribute
    background: true              # its picture blurred behind the card while on top
label: notify                     # plus every entity with this label
updates: true                     # default
repairs: true                     # default, admins only
hide_when_empty: true             # default
```

Without a `type` the card works out what each entity is: calendars show their running event, updates get an install button if the integration can install, alarm panels show while triggered, pending or arming, alerts while on, DWD weather warnings as one row per warning. An attribute holding an object with a `name` or `title` and a `description` or `image` is found on its own and shows as long as it is there: the name is the title, the description the text, the image the picture. `attribute` picks one by name or path, and a plain value there becomes the title. `type: picture` makes the state the title, for a sensor like the book of the day. Everything else shows while it is `on`, `active` or a number above zero.

Per entity there are also `name`, `icon`, `tap_action`, `actions` and `image`, an attribute like `cover` or `book.cover`, or a URL. Without `image` a row takes the entity's own picture: `entity_picture`, or an `image`, `image_url`, `picture` or `thumbnail` attribute holding a URL.

</details>

<details>
<summary>Taps, buttons and dismissing</summary>

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

Actions work as in any other card. Without a `tap_action` a row opens its entity; a system notification follows its first link, a repair opens the repairs page. A row with more text than fits opens up on a tap instead, and its icon still runs the action.

System notifications, updates and repairs are dismissed in Home Assistant: the notification is gone for everyone, the update skipped, the repair ignored. Everything else, and an update that installs itself, is only hidden in this browser until it happens again or says something new. Alarm panels can't be dismissed and stay until the panel moves on.

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

Keys are `system`, `updates` (every update entity), `repairs` or an entity id. People are matched through the user linked to them under Settings > People. While the dashboard is being edited, everyone sees everything.

</details>

<details>
<summary>Your own CSS</summary>

`css` is a stylesheet added after the card's own, so it can restyle any part of the card.

```yaml
css: |
  :host { --origami-radius: 20px; --origami-pad: 16px; }
  .row { border: 1px solid var(--divider-color); }
  .clear { color: var(--error-color); }
```

Variables: `--origami-pad`, `--origami-gap`, `--origami-gap-s`, `--origami-radius`, `--origami-radius-s`, `--origami-tile`, `--origami-tile-s`, `--origami-icon`, `--origami-muted`, `--origami-quiet`, `--origami-ease`, `--origami-time`, `--origami-focus`, `--origami-card-bg`, `--origami-row-bg`, `--origami-hover`, `--origami-max-height`, `--origami-bg-opacity` and `--origami-bg-blur` (the last three also in a theme).

Classes: `.head`, `.tile`, `.badge`, `.title`, `.msg`, `.ebar`, `.count`, `.list`, `.row`, `.rtile`, `.body`, `.when`, `.x`, `.act`, `.foot`, `.clear`, `.backdrop`.

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
