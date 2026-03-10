import { writeFileSync } from "node:fs";
import { toHTML } from "discord-markdown";

const testString = `# 🛡️ DISCORD MARKDOWN V2 TEST SUITE

## 1. THE BIG THREE HEADERS
# This is an H1
## This is an H2
### This is an H3 (Discord limit)

## 2. EMPHASIS & DECORATION
*Italic Text* or _Italic_
**Bold Text**
***Bold Italic Text***
~~Strikethrough~~
__Underlined Text__
__*Underlined Italic*__
__**Underlined Bold**__
__***Underlined Bold Italic***__

## 3. SPOILERS & LINKS
Spoiler: ||I am hidden until clicked||
Link: [Clickable Title](https://discord.com)
Clean Link: <https://google.com> (No embed)

## 4. QUOTES & LISTS
> Single-line quote
> (Must have space after >)

>>> Multi-line quote
This continues even if you
press enter multiple times
until the end of the message.

* Bullet Item
* Bullet Item
  * Nested Item (2 spaces)
1. Numbered Item
2. Numbered Item

## 5. DYNAMIC TIMESTAMPS (Unix)
<t:1735700400:t> ➔ Short Time
<t:1735700400:T> ➔ Long Time
<t:1735700400:d> ➔ Short Date
<t:1735700400:D> ➔ Long Date
<t:1735700400:f> ➔ Short Date/Time
<t:1735700400:F> ➔ Long Date/Time
<t:1735700400:R> ➔ Relative (e.g., "in 1 year")

## 6. MENTIONS & IDS
User: <@1234567890>
Channel: <#1234567890>
Role: <@&1234567890>
Custom Emoji: <:name:1234567890>
Animated Emoji: <a:name:1234567890>

## 7. CODE BLOCK COLOR HACKS

**ANSI (True Colors - Desktop Only)**
\`\`\`ansi
\u001b[2;31mRed\u001b[0m \u001b[2;32mGreen\u001b[0m \u001b[2;33mYellow\u001b[0m \u001b[2;34mBlue\u001b[0m \u001b[2;35mMagenta\u001b[0m \u001b[2;36mCyan\u001b[0m
\u001b[1;31mBold Red\u001b[0m
\u001b[1;33;44mBold Yellow on Blue BG\u001b[0m
\`\`\`

**Diff (Standard Colors)**
\`\`\`diff
+ Green Text (Addition)
- Red Text (Removal)
! Orange Text (Caution)
--- Grey Text ---
\`\`\`

**Fix (Yellow)**
\`\`\`fix
All text in here will be yellow.
\`\`\`

**YAML (Blue/Cyan)**
\`\`\`yaml
key: value (Blue keys, cyan values)
# Gray comments
\`\`\`

**Brainfuck (Dark Green)**
\`\`\`bf
Text inside a brainfuck block is often dark green.
\`\`\`

**CSS (Green/Blue/Orange)**
\`\`\`css
[Green brackets]
.BlueClass
#OrangeID
"Green String"
\`\`\``;

const result = toHTML(testString, { escapeHTML: true });
writeFileSync("output.html", result);
console.log("Done");
