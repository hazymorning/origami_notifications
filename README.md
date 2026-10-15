<img alt="Origami Notifications with a pizza timer, rain while a window is open and a water leak" src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/hero.webp">

<a href="https://github.com/hazymorning/origami_notifications/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/hazymorning/origami_notifications?label=Release&color=6A8778&labelColor=181715"></a>
<a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=hazymorning&repository=origami_notifications&category=plugin"><img alt="HACS custom repository" src="https://img.shields.io/badge/HACS-Custom-6A8778?labelColor=181715"></a>

Origami Notifications is a Home Assistant card that shows what needs attention right now. Notifications and updates appear on their own. Every entity you add appears only when it is relevant, such as a timer while it runs.

[Setup](#setup) · [Card](#card) · [Entities](#entities) · [Weather](#weather) · [Infos](#infos) · [Options](#options) · [Troubleshooting](#troubleshooting)

## Setup

<details>
<summary><b>HACS</b></summary>

<br>

1. [Open Origami Notifications in HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=hazymorning&repository=origami_notifications&category=plugin). If HACS asks you to add the repository, select **Add**. Then select **Download**.
2. Reload the page, edit a dashboard and add the **Origami Notifications** card.

</details>

<details>
<summary><b>Manual</b></summary>

<br>

1. Copy [`dist/origami-notifications.js`](dist/origami-notifications.js) to `/config/www`.
2. Add `/local/origami-notifications.js` as a **JavaScript module** under [Resources](https://my.home-assistant.io/redirect/lovelace_resources/).
3. Reload the page.

</details>

The card needs Home Assistant 2026.4 or newer.

## Card

The card shows one entry at a time and switches every 8 seconds. The ring around the icon fills until it switches, and the badge counts the entries. Warnings are orange. Smoke, a leak or a triggered alarm is red.

<img width="800" alt="The card in light and dark mode with a pizza timer, rain while a window is open, a water leak and the weather" src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/states.webp">

### List

Tap the card to see all entries. A wide card opens in place.

<img width="800" alt="The open card in light and dark mode with a water leak, a notification, a recipe, a pizza timer and rain" src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/list.webp">

A card narrower than 300 pixels opens the list in Home Assistant's dialog. On a phone, that is a bottom sheet.

<img width="800" alt="The list in a bottom sheet in light and dark mode" src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/sheet.webp">

<details>
<summary>How it works</summary>

<br>

| You do | What happens |
| --- | --- |
| Tap the card | The list opens. With only one entry, that entry opens instead. |
| Swipe the card or press an arrow key | The card switches to the next or the previous entry. |
| Tap an entry | Its entity, a notification's first link or the repairs page opens. If the text is cut off, the first tap shows all of it. |
| Tap the cross | The entry is dismissed, as described below. |

| Detail | Description |
| --- | --- |
| Order | Critical entries come first. All other entries are sorted by how close their time is to now. |
| Groups | Binary sensors of the same kind share one row when two or more of them are on, such as open windows. The row names their rooms. |

</details>

<details>
<summary>Dismissing</summary>

<br>

| Entry | What dismissing does |
| --- | --- |
| A Home Assistant notification | It is removed for everyone. |
| A repair | It is ignored in Home Assistant. |
| An update | For an admin, it is skipped in Home Assistant. For everyone else, and for updates that install themselves, it is hidden in this browser. |
| Anything else | It is hidden in this browser until it changes or happens again. A bin, for example, comes back for the next pickup. |
| An alarm panel or an info | It cannot be dismissed. |
| All entries at once | **Dismiss all** appears when the list has two or more entries. It dismisses every entry that can be dismissed. |

</details>

### Sizes

The card needs at least half the width of a sections view. With `vertical: true`, a quarter is enough. With `background: true`, the entry's picture appears behind the card.

<img width="800" alt="The card in different sizes in light and dark mode, with a recipe picture, a timer, an oven, a door, smoke and a robot vacuum" src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/sizes.webp">

### Footer

In the footer of a sections view, the card stays at the bottom of the screen.

<img width="800" alt="The card at the bottom of the screen in light and dark mode, with rain while a window is open" src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/footer.webp">

### Theme

The card follows your theme. The pictures above use the [Origami](https://github.com/hazymorning/origami) theme. With the default theme, the card looks like a tile card.

<img width="800" alt="The same cards with the default theme in light and dark mode" src="https://raw.githubusercontent.com/hazymorning/origami_notifications/main/images/theme.webp">

## Entities

You can add almost any entity under `entities`, and the card works out what kind it is. Each kind appears only at certain times or in certain states.

<details>
<summary>Kinds</summary>

<br>

| Entity | When it appears |
| --- | --- |
| Alarm panel | It appears while it is triggered, pending or arming. |
| Alert | It appears while it is on. |
| Calendar | It appears while an event runs. With `before`, it also appears that long before the next event starts. |
| Update | It appears while an update is available. |
| Entity with warnings, such as DWD, NINA or Meteoalarm | Each warning appears as its own row until it ends. A warning that starts later appears at once, with its start time. |
| Timer | It appears while it runs or is paused, with buttons to pause, resume and cancel it. |
| Sensor with a time, or with a duration and `type: countdown` | It appears while the time is ahead. With `before`, it appears only that long before the time. |
| Bins from Waste Collection Schedule, as a sensor or a calendar | A pickup appears from noon the day before and stays for the whole pickup day. |
| The Android app's next alarm | It appears in the 12 hours before the alarm rings. |
| Event | It appears for a day after it fires. It shows a picture from the same device, such as a camera's, when there is one. |
| To-do list with `type: todo` | Each item appears on its due day or when it is overdue, with a button to mark it as done. Items without a due date never appear. |
| Lock, cover, valve, vacuum, lawn mower or siren | It appears while Home Assistant counts it as active, such as an unlocked lock or an open cover. Where the device supports it, a button locks, closes, docks or turns it off. |
| Entity with an attribute that holds a `name` or `title` and a `description`, `summary` or picture | The attribute appears as an entry, whatever the entity's state. The recipe in the list above works like this. |
| Binary sensor for smoke, gas, carbon monoxide, moisture, heat or safety | It appears while it is on, and it is critical. |
| Anything else | It appears while it is on or active, or while its value is above 0. |

</details>

<details>
<summary>Entity options</summary>

<br>

| Option | Description |
| --- | --- |
| `type` | The kind of entity. Without it, the card detects the kind itself. It is one of `alarm`, `alert`, `attribute`, `calendar`, `countdown`, `device`, `event`, `generic`, `next_alarm`, `picture`, `timer`, `todo`, `update`, `warning` or `waste`. With `generic`, any state appears except off, idle, none, 0, unknown and unavailable. With `picture`, the state becomes the title. |
| `attribute` | The attribute to show, such as `next_due` or `book.title`. A plain value becomes the title. |
| `name` | A name that replaces the entity's name |
| `icon` | An icon that replaces the entity's icon |
| `color` | A theme color such as `green`, as on a tile, or any CSS color. Critical entries stay red, and warnings stay orange. |
| `image` | A picture from an attribute, or a URL. It replaces the entity's own picture. |
| `background` | Set to `true` to show the picture blurred behind the card while the card shows this entry. |
| `before` | How long before its time the entry appears, in minutes or as a duration such as `1:30:00`. It works for calendars, bins, the next alarm, countdowns and to-do lists. |
| `tap_action` | What a tap on the entry does. By default, a tap opens the entity. |
| `visibility` | Conditions from Home Assistant's visibility tab, which must all be met. With conditions, the entity appears in any state, such as a temperature above 28°. |
| `actions` | Buttons of your own, each with a `label` and a `tap_action`. The **Open recipe** button in the list above is one of these. |

</details>

## Weather

Set `weather` to a weather entity, and the card tells you about rain, snow, hail, thunderstorms and frost before they start. The entity needs an hourly or twice daily forecast.

<details>
<summary>How it works</summary>

<br>

| Entry | When it appears |
| --- | --- |
| Rain, snow, hail or thunderstorms | While it is dry, the entry appears up to 6 hours before the first wet hour and gives the chance of rain. |
| Frost | While it is above freezing, the entry appears up to 18 hours before the first hour below 0 °C or 32 °F. It gives the lowest temperature of those hours. |
| Rain with a window open | While a window is open, rain ahead appears as an orange warning that counts the open windows. Rain that has already started appears as well. |

</details>

## Infos

Infos are entities that the card shows after the entries, such as the forecast or the next sunrise. While there is an info, the card does not hide.

<details>
<summary>Info options</summary>

<br>

| Option | Description |
| --- | --- |
| `entity` | The entity to show |
| `name`, `icon`, `color`, `show_entity_picture` | These work as on a tile card. Without a name, a calendar shows its event as the title, and a weather entity shows the time, such as Now or Tomorrow. |
| `state_content`, `time_format` | What the second line shows, such as `[temperature, state]` or `next_rising` |
| `forecast_type` | Set to `daily`, `hourly` or `twice_daily` to add a weather entity's forecast. |
| `forecast_slots` | How many days or hours of the forecast the card shows. The default is 1. |
| `show_current`, `show_forecast` | These work as on Home Assistant's weather forecast card. Both are on unless you set them to `false`. |
| `tap_action`, `hold_action`, `double_tap_action` | What a tap, a hold and a double tap do. By default, a tap opens the entity. A hold and a double tap work only on the card, not in the list. |
| `visibility` | Conditions from Home Assistant's visibility tab. The info shows only while all of them are met. |

</details>

## Options

The visual editor covers every option except `actions`, which you add in YAML.

<details>
<summary>Card options</summary>

<br>

| Option | Default | Description |
| --- | --- | --- |
| `entities` | | The entities to watch, described under [Entities](#entities) |
| `label` | | A label. The card also watches every entity with this label. In YAML, this is the label ID. |
| `weather` | | A weather entity for rain, snow and frost ahead, described under [Weather](#weather) |
| `infos` | | Entities that always show after the entries, described under [Infos](#infos) |
| `updates` | `true` | Shows every available update. Set to `false` to show only the updates under `entities`. |
| `repairs` | `true` | Shows repairs to admins. Set to `false` to hide them. |
| `hide_when_empty` | `true` | Hides the card when there is nothing to show. Set to `false` to keep it, and to show the weather and your next events after the entries. |
| `vertical` | `false` | Set to `true` to put the icon above the text, as on a tile card with vertical content. In a sections view, the card can then be as narrow as 3 columns instead of 6. |
| `rotate` | `8` | The seconds before the card switches to the next entry. At `0`, the card does not switch on its own, but you can still swipe it. |
| `slide` | `up` | Whether the text slides `up` or to the `side` when the card switches. A swipe always slides it to the side. |
| `audience` | | Who sees which entries, described under Who sees what |
| `css` | | Your own CSS, described under Styling |

</details>

<details>
<summary>Who sees what</summary>

<br>

Here, only Anna sees Home Assistant's notifications, and the kid does not see the weather warnings.

```yaml
audience:
  system:
    only: [person.anna]
  sensor.dwd_weather_warnings:
    except: [person.kid]
```

| Key | Covers |
| --- | --- |
| `system` | Home Assistant's notifications |
| `updates` | All updates |
| `repairs` | Repairs, which only admins see |
| An entity ID | That entity. The weather entity's ID covers its rain and frost entries. |

The card matches people through the user linked to them under [People](https://my.home-assistant.io/redirect/people/). The rules change only the card, not what people can see in Home Assistant.

</details>

<details>
<summary>Styling</summary>

<br>

Styles in `css` come after the card's own, so they override them.

| Variable | Default | Description |
| --- | --- | --- |
| `--origami-pad`, `--origami-gap` | `10px`, `10px` | The padding, and the space between icon and text |
| `--origami-tile`, `--origami-icon` | `36px`, `24px` | The size of the icon area and of the icon |
| `--origami-radius` | `8px` | The corner radius of the rows |
| `--origami-card-bg`, `--origami-row-bg` | theme, none | The card's and the rows' background |
| `--origami-hover`, `--origami-focus` | light tint, theme | The hover tint and the keyboard focus ring |
| `--origami-pulse-opacity` | `0.3` | How strongly the card pulses while an entry is critical. This also works in a theme. |
| `--origami-max-height` | none | The maximum height of the card and its dialog. A longer list scrolls inside. The default is `25dvh` in the footer and `70vh` in the dialog. This also works in a theme. |
| `--origami-bg-opacity`, `--origami-bg-blur` | `0.22` (`0.32` dark), `24px` | The opacity and blur of the background picture. These also work in a theme. |
| `--ha-tile-*` | theme | The card follows the theme's tile variables, such as `--ha-tile-icon-border-radius`. |

| Part | Classes |
| --- | --- |
| Card | `.head` with `.icon`, `.cycle` for the ring, `.badge`, `.title` and `.secondary` |
| List | `.bar` with `.count`, the `.list` of `.row` elements and the `.foot` with `.clear` |
| Row | `.icon`, `.title`, `.time`, `.dismiss`, `.message` and the `.actions` with `.action` buttons. The dialog uses the same classes. |
| Row state | `.warn` or `.crit`, and the kind in `data-kind`, such as `update`, `weather` or `group` |
| Background picture | `.backdrop` |

</details>

<details>
<summary>Full example</summary>

<br>

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
  - sensor.dwd_weather_warnings
  - entity: sensor.dinner
    background: true
    actions:
      - label: Open recipe
        tap_action:
          action: url
          url_path: https://tandoor.dev
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

## Troubleshooting

<details>
<summary>The card does not appear</summary>

<br>

The card hides while there is nothing to show, but it always appears while you edit the dashboard. To keep it visible, set `hide_when_empty` to `false`.

</details>

<details>
<summary>Rain and frost never appear</summary>

<br>

The weather entity needs an hourly or twice daily forecast. Set it as `weather`, because a weather entity under `entities` shows nothing.

</details>

<details>
<summary>Another device still shows a dismissed entry</summary>

<br>

Most entries are hidden only in the browser where you dismissed them.

</details>

## License

Origami Notifications is licensed under [MIT](LICENSE).
