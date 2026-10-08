# ◪ Origami Notifications

A Home Assistant card for whatever needs attention right now. When nothing does, it folds away.

<img src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/card.webp" alt="The closed card turning through its entries">

Home Assistant keeps its notifications behind a bell in the sidebar. On a wall tablet, nobody has ever opened it. Updates and repairs wait in the settings until someone goes looking.

Everything else ends up on the dashboard as tiles. The bin tile sits there all week for the one evening it matters. Conditional cards fix that one entity at a time, for as long as patience lasts.

This card shows all of it in one row, and only while it matters.

- **No setup for the basics.** Home Assistant's notifications, repairs and updates show up on their own.
- **Entities only while they matter.** A door shows while it's open, a timer while it runs and the bins from noon the day before.
- **Rain before it rains.** Rain, snow and thunder show up to 6 hours ahead, and frost up to 18. With a window open, rain becomes a warning.
- **One row, however busy the day.** The closed card turns through what needs attention. A tap opens the list, in Home Assistant's dialog where the card is narrow. Quiet times can show the weather and the next event instead.
- **Buttons where they help.** Pause a timer, tick off a to-do or close the garage from the list.
- **Dismissed stays dismissed.** An entry comes back only when something changes. The bins still come back every week.
- **Urgent things first.** Smoke, a leak or a triggered alarm goes on top in red, and the card pulses while it lasts.
- **Looks like it came with Home Assistant.** It follows the tile card and your theme. Home Assistant's own words come in your language.

<img src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/popup.webp" alt="The closed card, and its list in a bottom sheet on a phone">

## Install

In HACS, add `https://github.com/hazymorning/origami_notifications` as a custom repository of type Dashboard, then download Origami Notifications. The card needs Home Assistant 2026.4 or newer.

Without HACS, copy `dist/origami-notifications.js` to `/config/www/` and add `/local/origami-notifications.js` as a dashboard resource of type JavaScript module.

<details>
<summary>An easy setup</summary>

This one watches the weather and a few things around the house.

```yaml
type: custom:origami-notifications
weather: weather.home
entities:
  - binary_sensor.front_door
  - binary_sensor.washing_machine
  - timer.pizza
  - calendar.family
```

</details>

<details>
<summary>A setup with everything</summary>

The sections below explain each part.

```yaml
type: custom:origami-notifications
weather: weather.home
label: notify
hide_when_empty: false
rotate: 6
slide: side
entities:
  - binary_sensor.front_door
  - cover.garage_door
  - timer.pizza
  - sensor.dinner
  - sensor.dwd_weather_warnings
  - entity: calendar.family
    before: 120
  - entity: todo.chores
    type: todo
  - entity: sensor.paper_bin
    type: waste
    color: blue
  - entity: sensor.washer_remaining
    type: countdown
    before: 10
  - entity: event.cat_flap
    name: Chelsea
    image: /local/chelsea.jpg
    background: true
  - entity: sensor.attic_temperature
    visibility:
      - condition: numeric_state
        above: 28
  - entity: binary_sensor.doorbell
    tap_action:
      action: navigate
      navigation_path: /dashboard-home/cameras
    actions:
      - label: Open the door
        tap_action:
          action: perform-action
          perform_action: lock.open
          target:
            entity_id: lock.front_door
infos:
  - entity: weather.home
    forecast_type: twice_daily
    forecast_slots: 2
  - entity: sun.sun
    name: Sunrise
    state_content: next_rising
    visibility:
      - condition: state
        entity: sun.sun
        state: below_horizon
audience:
  updates:
    only: [person.anna]
  sensor.dwd_weather_warnings:
    except: [person.kid]
css: |
  :host {
    --origami-pad: 16px;
    --origami-tile: 40px;
    --origami-max-height: 60vh;
  }
  .row[data-kind="update"] { opacity: 0.6; }
```

</details>

<details>
<summary>Options</summary>

| Option | Default | |
| --- | --- | --- |
| `entities` | | Entities to watch, see Entities |
| `label` | | Also watch every entity with this label. In YAML it's the label ID. |
| `infos` | | Entities that turn by after what needs attention, see Infos |
| `weather` | | A weather entity. While it is dry, rain, snow, hail and thunder show up to 6 hours ahead. Frost shows up to 18 hours ahead. With a window open anywhere in Home Assistant, rain is a warning, and rain that has started shows too. Rain and frost ahead need an hourly or twice daily forecast. |
| `updates` | `true` | Show available updates |
| `repairs` | `true` | Show repairs, to admins only |
| `hide_when_empty` | `true` | Hide the card when there is nothing to show. With `false`, quiet times show the weather, the next events and the infos. |
| `vertical` | `false` | The icon above the text, like a tile with vertical content. The text then has the whole width, as in half a header. |
| `rotate` | `8` | Seconds between turns of the closed card. A ring around the icon fills until the next turn, which waits up to 10 seconds for long text to scroll to its end. At `0` it holds still. A swipe or an arrow key turns it by hand. The turns wait while the list is open, a finger is on the card or the card is out of sight. |
| `slide` | `up` | Whether the text moves `up` or to the `side` at a turn |
| `audience` | | Who sees what, see below |
| `css` | | Your own CSS, see Styling |

The visual editor has all of it except buttons. The card's own words are in English or German.

</details>

<details>
<summary>Entities</summary>

| Entity | Shows while |
| --- | --- |
| Alarm panel | triggered, pending or arming |
| Alert | on |
| Calendar | an event is running, or starts within `before` |
| Update | an update is available |
| Sensor with warnings in its attributes, like DWD, NINA or Meteoalarm | there are warnings, one row each, until they expire |
| Timer | running or paused, with buttons to pause, resume and cancel |
| Sensor with a time, or with a duration and `type: countdown` | the time lies ahead, or lies within `before` |
| Bins of Waste Collection Schedule, a sensor or a calendar | from noon the day before until the pickup |
| Next alarm of the Android app | in the 12 hours before it rings |
| Event | for a day after it fired, with the picture of its device |
| To-do list with `type: todo` | an item is due today, overdue or due within `before`, with a button to mark it done |
| Lock, cover, valve, vacuum, lawn mower, siren | active, with a button to lock, close, dock or turn it off |
| Sensor with a `name` or `title` plus a `description`, `summary` or picture in an attribute, like tonight's dinner or a parcel | the thing is there, whatever the state |
| Anything else | on, active or a number above 0 |

| Option | |
| --- | --- |
| `type` | Skip the detection with `calendar`, `waste`, `update`, `alarm`, `alert`, `timer`, `countdown`, `next_alarm`, `event`, `todo`, `device`, `warning`, `attribute`, `picture` or `generic`. `generic` shows any state but off, idle, none, 0, unknown and unavailable. `picture` shows the state as the title. |
| `attribute` | The attribute to show, like `next_due` or `book.title`. A plain value becomes the title. |
| `name` | Replaces the entity's name, not the event or the thing it shows |
| `icon` | Replaces the icon |
| `color` | A theme color like `green`, as on a tile, or any CSS color. An event on show has the color of a running calendar. |
| `image` | A picture from an attribute or a URL, instead of the entity's own |
| `background` | Shows the picture blurred behind the card while this entity is on top |
| `before` | For anything with a time ahead, how far ahead it shows, in minutes or as a duration like `1:30:00` |
| `tap_action` | What a tap on its row does, and on the closed card while it is the only entry. By default it opens the entity. |
| `visibility` | The conditions of Home Assistant's visibility tab. It shows only while all of them hold. A plain entity then shows whatever its state, like a temperature above 28°. |
| `actions` | Buttons, each with a `label` and a `tap_action` |

A tap on a row opens its entity, a notification's first link or the repairs page. If the text is cut off, a tap shows all of it, and a tap on the icon does the action. A notification shows its first picture.

Critical rows stay on top in red, and the closed card pulses and shows only them. These are a triggered alarm, a sounding siren, a severe warning, a critical repair and a sensor for smoke, gas, carbon monoxide, leaks, heat or safety that is on. Everything else is sorted by how close it is to now.

Sensors of one kind that are on, like open windows, share one row with their rooms.

</details>

<details>
<summary>Infos</summary>

Infos take the options of a tile card.

| Option | |
| --- | --- |
| `entity` | The entity to show |
| `name`, `icon`, `color`, `show_entity_picture` | As on a tile. Without a name, a calendar leads with its next event and the weather with the time it shows. |
| `state_content`, `time_format` | What the second line says, like `[temperature, state]` or `next_rising` |
| `forecast_type` | For a weather entity, `daily`, `hourly` or `twice_daily` adds the forecast |
| `forecast_slots` | How many days or hours turn by, 1 unless set |
| `show_current`, `show_forecast` | As on Home Assistant's forecast card, both show unless `false` |
| `tap_action`, `hold_action`, `double_tap_action` | What a tap, a hold and a double tap do. A tap opens the entity. |
| `visibility` | The conditions of Home Assistant's visibility tab. All of them must hold. |

</details>

<details>
<summary>Dismissing</summary>

| Dismissing | |
| --- | --- |
| A Home Assistant notification | removes it for everyone |
| A repair | ignores it, for admins |
| An update | skips it, for admins. Admins can also install it where its integration allows. |
| Anything else | hides it in this browser until it happens again or changes. That includes updates that install themselves, since Home Assistant can't skip them. |

Alarm panels can't be dismissed.

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

This only tidies the card. Everyone still sees every entity in Home Assistant.

</details>

<details>
<summary>Styling</summary>

Everything in `css` comes after the card's own styles.

| Variable | Default | |
| --- | --- | --- |
| `--origami-pad`, `--origami-gap` | `10px`, `10px` | Padding, and the space between icon and text |
| `--origami-tile`, `--origami-icon` | `36px`, `24px` | Size of the icon area and of the icon |
| `--origami-radius` | `8px` | Corners of the rows |
| `--origami-card-bg`, `--origami-row-bg` | theme, none | Card and row background |
| `--origami-hover`, `--origami-focus` | light tint, theme | Hover tint and keyboard focus ring |
| `--origami-pulse-opacity` | `0.3` | How strongly the card pulses while something is critical, like Home Assistant's alert card |
| `--origami-max-height` | none, `70vh` for the popup | The highest the card and its popup get. The list scrolls inside, as with a fixed height or in the footer of a sections view. |
| `--origami-bg-opacity`, `--origami-bg-blur` | `0.22` (`0.32` dark), `24px` | The background picture |

`--origami-max-height`, `--origami-bg-opacity` and `--origami-bg-blur` also work in a theme. The closed card follows the tile variables of the theme, like `--ha-tile-icon-border-radius`.

| Part | Classes |
| --- | --- |
| Closed | `.head` with `.icon`, `.cycle` for the ring, `.badge`, `.title` and `.secondary` |
| Open | `.bar` with `.count`, the `.list` of `.row`s and the `.foot` with `.clear` |
| Row | `.icon`, `.title`, `.time`, `.dismiss`, `.message` and the `.actions` with `.action` buttons, the same in the dialog |
| Row state | `.warn` or `.crit`, and the kind in `data-kind`, like `update`, `weather` or `group` |
| Background picture | `.backdrop` |

</details>

<details>
<summary>Development</summary>

`npm run build` bundles the card from `src` into `dist`. `npm test` and `npm run lint` check it.

</details>
