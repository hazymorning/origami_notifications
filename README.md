# ◪ Origami Notifications

A notification card for Home Assistant that folds away when there is nothing to see.

![The card closed on a phone and open next to it](https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/dark-and-light-preview.png)

Closed, the card is one row that shows what is closest to now, or the newest critical notification. Tap it and it unfolds into the full list.

Home Assistant's notifications, repairs and updates show up without any setup. Add any entity, and the card shows it while it needs attention, like an open door, a running timer or a calendar event. A weather entity adds rain and frost ahead.

**You can style the card with plain CSS.**

```yaml
type: custom:origami-notifications
weather: weather.home
entities:
  - binary_sensor.front_door
  - alarm_control_panel.home
  - calendar.family
css: |
  :host { --origami-radius: 20px; }
  .row[data-kind="update"] { opacity: 0.6; }
```

## Install

In HACS, add `https://github.com/hazymorning/origami_notifications` as a custom repository of type Dashboard, then download Origami Notifications. The card needs Home Assistant 2025.4 or newer.

Without HACS, copy `dist/origami-notifications.js` to `/config/www/` and add `/local/origami-notifications.js` as a dashboard resource of type JavaScript module.

<details>
<summary>Styling</summary>

Everything in `css` goes into the card after its own styles, so you can change any part of it.

| Variable | Default | |
| --- | --- | --- |
| `--origami-pad` | `12px` | Padding, and the space between rows |
| `--origami-gap`, `--origami-gap-s` | `12px`, `8px` | Space between icon and text, and small gaps |
| `--origami-radius`, `--origami-radius-s` | `12px`, `8px` | Corners of the rows and the closed tile, and of the row icons, the badge and the buttons |
| `--origami-tile`, `--origami-tile-s` | `40px`, `32px` | Size of the icon tile, closed and in the rows |
| `--origami-icon` | `20px` | Icon size in the closed tile |
| `--origami-card-bg`, `--origami-row-bg` | theme | Card and row background |
| `--origami-muted`, `--origami-quiet` | `0.6`, `0.45` | Opacity of secondary text, and of times and the dismiss button |
| `--origami-hover`, `--origami-focus` | light tint, theme | Hover tint and keyboard focus ring |
| `--origami-max-height` | none | The card's maximum height. The open list scrolls inside. |
| `--origami-bg-opacity`, `--origami-bg-blur` | `0.22` (`0.32` dark), `24px` | The background picture |

`--origami-max-height`, `--origami-bg-opacity` and `--origami-bg-blur` also work in a theme.

Closed, the card is the `.head` with `.tile`, `.badge`, `.title`, `.msg` and `.eta`. Open, it has the `.ebar` with the `.count`, the `.list` of `.row`s and the `.foot` with `.clear`. A row has `.rtile`, `.title`, `.when`, `.x`, `.body` and `.act` buttons. The background picture is in `.backdrop`.

Rows carry `.warn` or `.crit`, and a `data-kind` of `system`, `repair`, `update`, `calendar`, `alarm`, `alert`, `dwd`, `timer`, `countdown`, `event`, `todo`, `device`, `warning`, `weather`, `group`, `attribute`, `picture` or `generic`.

With a fixed height from the layout tab, or in the footer of a sections view, the open list scrolls inside the card.

</details>

<details>
<summary>Options</summary>

| Option | Default | |
| --- | --- | --- |
| `entities` | | Entities to watch, see below |
| `label` | | Also watch every entity with this label. In YAML it's the label ID. |
| `weather` | | A weather entity. While it is dry, rain, snow, hail and thunder show up to 6 hours ahead. Frost shows up to 18 hours ahead. With a window open anywhere in Home Assistant, rain is a warning, and rain that has started shows too. Rain and frost ahead need an hourly or twice daily forecast. |
| `updates` | `true` | Show available updates |
| `repairs` | `true` | Show repairs, to admins only |
| `hide_when_empty` | `true` | Hide the card when there is nothing to show |
| `audience` | | Who sees what, see below |
| `css` | | Your own CSS, see Styling |

The visual editor has all of it except `css` and buttons. The card's texts are in English and German. Other languages get Home Assistant's words where it has them, and English otherwise.

</details>

<details>
<summary>Entities</summary>

| Entity | Shows while |
| --- | --- |
| Alarm panel | triggered, pending or arming |
| Alert | on |
| Calendar | an event is running, or starts within `before` |
| Update | an update is available |
| DWD weather warnings | there are warnings, one row each |
| NINA or Meteoalarm warning | on, until the warning expires |
| Timer | running or paused, with buttons to pause, resume and cancel |
| Sensor with a time, or with a duration and `type: countdown` | the time lies ahead |
| Event | for a day after it fired, with the picture of its device |
| To-do list with `type: todo` | an item is due today, overdue or due within `before`, with a button to mark it done |
| Lock, cover, valve, vacuum, lawn mower, siren | active, with a button to lock, close, dock or turn it off |
| Anything else | on, active or a number above 0 |

Some sensors describe a thing in an attribute, like tonight's dinner, a library book or a parcel. If the attribute holds a `name` or `title` plus a `description`, `summary` or picture, the card shows that thing for as long as it is there, whatever the state.

Every entity can take these options.

| Option | |
| --- | --- |
| `type` | Skip the detection with `calendar`, `update`, `alarm`, `alert`, `dwd`, `timer`, `countdown`, `event`, `todo`, `device`, `warning`, `attribute`, `picture` or `generic`. `generic` shows any state but off, idle, none, 0, unknown and unavailable. `picture` shows the state as the title. |
| `attribute` | The attribute to show, like `next_due` or `book.title`. A plain value becomes the title. |
| `name` | Replaces the entity's name, not the event or the thing it shows |
| `icon` | Replaces the icon |
| `image` | A picture from an attribute or a URL, instead of the entity's own |
| `background` | Shows the picture blurred behind the card while this entity is on top |
| `before` | For a calendar or a to-do list, how far ahead it shows, in minutes or as a duration like `1:30:00` |
| `tap_action` | What a tap does. By default it opens the entity. |
| `actions` | Buttons, each with a `label` and a `tap_action` |

```yaml
entities:
  - entity: binary_sensor.doorbell
    actions:
      - label: Open the door
        tap_action:
          action: perform-action
          perform_action: lock.open
          target:
            entity_id: lock.front_door
```

A tap on a row opens its entity. A notification follows its first link and shows its first picture, and a repair opens the repairs page. If a row's text is cut off, a tap shows all of it, and a tap on its icon does the action.

Critical rows have a red icon and stay on top. These are a triggered alarm, a sounding siren, a severe warning, a critical repair and a sensor for smoke, gas, carbon monoxide, leaks, heat or safety that is on. Everything else is sorted by how close it is to now.

Sensors of one kind that are on, like open windows, share one row with their rooms.

</details>

<details>
<summary>Dismissing</summary>

Dismissing a Home Assistant notification removes it for everyone. For admins, dismissing a repair ignores it and dismissing an update skips it. Admins can also install an update from the card, if its integration supports that.

Everything else is only hidden in this browser, until it happens again or changes. That includes updates that install themselves, since Home Assistant can't skip them. Alarm panels can't be dismissed. Home Assistant's notice about a failed login never shows up.

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

The keys are `system` for Home Assistant's notifications, `updates`, `repairs` or an entity ID. People are matched by the user account linked to them in Settings > People. While you edit the dashboard, you see everything.

</details>
