---
tags: ["python","automation"]
title: Achieving more immersion with some automation
description: "I bought a game that I wanted to play for a long time: Red Dead Redemption 2 (RDR2)..."
pubDatetime: 2020-10-30
---
Cyberpunk 2077 has been delayed. Again. I cannot spend too much time playing games lately, so I was holding my quota for playing a long game for Cyberpunk. Since it got delayed, I bought a game that I wanted to play for a long time: Red Dead Redemption 2 (RDR2). Playing on PC obviously. 

I downloaded the 120GB game and started playing and realized that my lamps were too bright. I have these Wi-Fi bulbs so I adjusted them to a very low warm white. So the first hour of RDR2 plays on snowy terrain. When I was playing on snow, warm white felt too yellow. So I decided to change the light according to surroundings for better immersion. On open field it was cold blue/white and on indoors with candlelight it was yellowish color. And it was amazing :)

There was a small caviat: I had to switch the light by myself manually and I cannot express how much that bothered me. Since I am a bored and lazy person in general, I decided to automatize this. I wrote a small Python script. Idea is simple:

- Get the screen in every 5-10 seconds.
- Calculate the average RGB value of the pixels.
- Change all lights to that color.

```python
async def mainLoop(bulbs):
    while True:
        r, g, b = get_average_screen_color()
        color = PilotBuilder(rgb = (r, g, b))
        print(f'Changing {len(bulbs)} to RGB({r},{g},{b})')
        for bulb in bulbs:
            await bulb.turn_on(color)
        await asyncio.sleep(10)
```
Every color has you see on screen can be described with an RGB (Red, Green, Blue) value. Every color on screen is just a mixture of these colors. They can have a value between 0-255. For example, you can say RGB(156, 48, 123) which is a deep purple.  Hence, you often see "16M colors" in marketing. It is just 256 * 256 * 256, well because that's how math works.

Thanks to a small [library](https://github.com/sbidy/pywizlight) to communicate with the lamps, I have implemented the first draft. Communicating with the lamps is simple in theory. They work in WiFi, they all use the same port. So if you use some analyzers to find out which ports they are using, you can interfere with that channel. But, since there is an already existing library I used that. It was working quite fine, but there was a problem. average color was not saturated enough. Thus, I converted the **RGB** values to **HLS**(Hue, Luminosity and Saturation) and cranked up the saturation if it is below some level.

```python
def adjust_color_saturation(rgb):
    r, g, b = rgb
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
    if s < MIN_SATURATION:
        r, g, b = colorsys.hls_to_rgb(h, l, MIN_SATURATION)
        return (int(r*255), int(g*255), int(b*255))
    else:
        return (r,g,b)
```

Also I didn't like the constant change because in some cases it was distracting. Sometimes just when the program took screenshots there would be a character in the game zoomed in, which made the colors just that guys clothes. I have implemented a small caching to check the difference between the last couple of samples to determine if the change was necessary. I used Euclidian distance to check distance, which is not ideal, but gets the job done.

```python
def should_update_lights(r,g,b):
    collection.append((r,g,b))
    if collection[0] == 0 or collection[1] == 0:
        return True
    
    distance_with_old = get_distance((r,g,b), collection[0])
    distance_between_old_prev = get_distance(collection[0], collection[1])

    if distance_between_old_prev < CHANGE_TOLERANCE:
        return False;
    else:
        if distance_with_old < CHANGE_TOLERANCE:
            return False
        else:
            return True
```

The code is not amazing and extraordinary, but it can be accessed [here](https://github.com/BunColak/AutoScreenWiZLights). It works with WiZ Smart Lights. But the code is clean enough if you want to change the library for bulbs. 