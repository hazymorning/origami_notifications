# ◪ Origami Notifications

A notification card for Home Assistant that folds away when there is nothing to see.

<img src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/card.webp" alt="The closed card turning through its entries">

Closed, the card is one row that turns through what needs attention, then your infos. Long text scrolls. A tap unfolds the list. Where the card is narrow, the list opens in Home Assistant's dialog, a bottom sheet on a phone.

<img src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/popup.webp" alt="The list in a bottom sheet on a phone">

Home Assistant's notifications, repairs and updates show up without setup. Add any entity, and the card shows it while it needs attention, like an open door or a running timer. A weather entity adds rain and frost ahead.

Infos, like the next sunrise, are set up like tiles. With `hide_when_empty: false` the weather now and what comes next, and the next event of each calendar, join them.

A row leads with what happens, like an event or a pickup. The weather leads with the time it shows, like now or tonight. Anything else leads with its name, as on a tile.

```yaml
type: custom:origami-notifications
weather: weather.home
entities:
  - binary_sensor.front_door
  - alarm_control_panel.home
  - calendar.family
infos:
  - entity: weather.home
    state_content: [temperature, state]
  - entity: sun.sun
    name: Sunrise
    state_content: next_rising
css: |
  :host { --origami-radius: 4px; }
  .row[data-kind="update"] { opacity: 0.6; }
```

## Install

In HACS, add `https://github.com/hazymorning/origami_notifications` as a custom repository of type Dashboard, then download Origami Notifications. The card needs Home Assistant 2026.4 or newer.

Without HACS, copy `dist/origami-notifications.js` to `/config/www/` and add `/local/origami-notifications.js` as a dashboard resource of type JavaScript module.

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
| `--origami-max-height` | none, `70vh` for the popup | The highest the card and its popup get. The list scrolls inside. |
| `--origami-bg-opacity`, `--origami-bg-blur` | `0.22` (`0.32` dark), `24px` | The background picture |

`--origami-max-height`, `--origami-bg-opacity` and `--origami-bg-blur` also work in a theme. The closed card follows the tile variables of your theme, like `--ha-tile-icon-border-radius`.

| Part | Classes |
| --- | --- |
| Closed | `.head` with `.icon`, `.cycle` for the ring, `.badge`, `.title` and `.secondary` |
| Open | `.bar` with `.count`, the `.list` of `.row`s and the `.foot` with `.clear` |
| Row | `.icon`, `.title`, `.time`, `.dismiss`, `.message` and the `.actions` with `.action` buttons, the same in the dialog |
| Background picture | `.backdrop` |

Rows carry `.warn` or `.crit`, and their kind in `data-kind`, like `update`, `weather` or `group`.

With a fixed height, or in the footer of a sections view, the open list scrolls inside.

</details>

<details>
<summary>Options</summary>

| Option | Default | |
| --- | --- | --- |
| `entities` | | Entities to watch, see below |
| `label` | | Also watch every entity with this label. In YAML it's the label ID. |
| `infos` | | Entities that turn by after what needs attention, see Infos |
| `weather` | | A weather entity. While it is dry, rain, snow, hail and thunder show up to 6 hours ahead. Frost shows up to 18 hours ahead. With a window open anywhere in Home Assistant, rain is a warning, and rain that has started shows too. Rain and frost ahead need an hourly or twice daily forecast. |
| `updates` | `true` | Show available updates |
| `repairs` | `true` | Show repairs, to admins only |
| `hide_when_empty` | `true` | Hide the card when there is nothing to show. With `false`, quiet times show the weather, the next events and your infos. |
| `vertical` | `false` | The icon above the text, like a tile with vertical content. The text then has the whole width, as in half a header. |
| `rotate` | `8` | Seconds between turns of the closed card. A ring around the icon fills until the next turn, which waits up to 10 seconds for long text to scroll to its end. At `0` it holds still. A swipe or an arrow key turns it by hand. The turns wait while the list is open, a finger is on the card or the card is out of sight. |
| `slide` | `up` | Whether the text moves `up` or to the `side` at a turn |
| `audience` | | Who sees what, see below |
| `css` | | Your own CSS, see Styling |

The visual editor has all of it except buttons. Words Home Assistant has come from it, in your language. The rest is in English or German.

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

```yaml
infos:
  - entity: weather.home
    show_current: false
    forecast_type: daily
    forecast_slots: 2
  - entity: sun.sun
    name: Sunrise
    state_content: next_rising
    visibility:
      - condition: state
        entity: sun.sun
        state: below_horizon
```

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
| Anything else | on, active or a number above 0 |

Some sensors describe a thing in an attribute, like tonight's dinner, a library book or a parcel. If the attribute holds a `name` or `title` plus a `description`, `summary` or picture, the card shows that thing for as long as it is there, whatever the state.

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

```yaml
entities:
  - entity: sensor.attic_temperature
    visibility:
      - condition: numeric_state
        above: 28
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

Critical rows have a red icon and stay on top, and the closed card pulses and shows only them. These are a triggered alarm, a sounding siren, a severe warning, a critical repair and a sensor for smoke, gas, carbon monoxide, leaks, heat or safety that is on. Everything else is sorted by how close it is to now.

Sensors of one kind that are on, like open windows, share one row with their rooms.

</details>

<details>
<summary>Dismissing</summary>

Dismissing a Home Assistant notification removes it for everyone. For admins, dismissing a repair ignores it and dismissing an update skips it. Admins can also install an update, where its integration allows it.

Everything else is only hidden in this browser, until it happens again or changes. That includes updates that install themselves, since Home Assistant can't skip them. Alarm panels can't be dismissed.

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
<summary>Development</summary>

`npm run build` bundles the card from `src` into `dist`. `npm test` and `npm run lint` check it.

</details>
