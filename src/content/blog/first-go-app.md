---
title: "Greetings in the Terminal with Go"
description: "A first small Go program that greets me with the date whenever I open a terminal, and the two things it taught me on the way: Printf's format verbs, and Go's reference-date approach to formatting time."
created: 2025-08-20T22:12:24.871Z
---

#### A first little wee Go application

I have finally bit the bullet and started building things in a statically typed, compiled language. This one is just printing out some text in my terminal when I open a new instance, but you need to start somewhere with these things.

Goings on in here include standard library imports, a couple functions, and getting familiar with Go's slightly weird template string syntax (wherein you pass extra args to `Printf`, then signal them in the string with a `%` sign followed by an indicator of the type involved, which is `s` for string in this case). So my `today()` func which outputs a `string` can be passed in to `Printf` and used with `%s`.

Another curveball is date-time formatting. Coming from `date-fns` in Typescript (where you might call `format(yourDate, 'mmm dd yyyy')` or something), it's truly odd to me that to format the date in the style of "Monday, January 2", you pass in a ... `"Monday, January 2"`. This is a 'reference date' that indicates the form that `format` will follow.  Any day of the year will take the format of "full-day, full-month day number". You can trim "Monday" down to "Mon" and get results like "Thu", "Tue" and so on.

```go
package main

import (
  "fmt"
  "time"
)

func main() {
  fmt.Printf("Hello!  It's %s.\nWhat are your goals today?\nHave you checked your iCal?\n", today())
}

func today() string {
  // Define the time formatting based on the reference time:
  // "Monday" for full weekday name
  // "January" for full month name
  // "2" for day of the month
  t := time.Now()
  formattedTime := t.Format("Monday, January 2")

  day := t.Day()                // Extract the day of the month as an integer (1-31)
  suffix := "th"                // Default suffix for most days (4th, 5th, 6th, 7th, 8th, 9th, 10th, etc.)
  if day%10 == 1 && day != 11 { // Check if day ends in 1 but is not 11 (1st, 21st, 31st)
    suffix = "st"
  } else if day%10 == 2 && day != 12 { // Check if day ends in 2 but is not 12 (2nd, 22nd)
    suffix = "nd"
  } else if day%10 == 3 && day != 13 { // Check if day ends in 3 but is not 13 (3rd, 23rd)
    suffix = "rd"
  }
  return formattedTime + suffix
}
```
