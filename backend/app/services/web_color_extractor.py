import requests
import re
import webcolors
from bs4 import BeautifulSoup
from urllib.parse import urljoin


class WebsiteColorExtractor:

    def __init__(self, url):
        self.url = url

    def hex_to_rgb(self, hex_color):
        hex_color = hex_color.lstrip('#')

        if len(hex_color) == 3:
            hex_color = ''.join([c * 2 for c in hex_color])

        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def closest_color(self, requested_color):
        min_colors = {}

        for name in webcolors.names("css3"):
            hex_val = webcolors.name_to_hex(name)
            r_c, g_c, b_c = webcolors.hex_to_rgb(hex_val)

            rd = (r_c - requested_color[0]) ** 2
            gd = (g_c - requested_color[1]) ** 2
            bd = (b_c - requested_color[2]) ** 2

            min_colors[(rd + gd + bd)] = name

        return min_colors[min(min_colors.keys())]

    def get_color_name(self, rgb):
        try:
            return webcolors.rgb_to_name(rgb)
        except ValueError:
            return self.closest_color(rgb)

    def fetch_css_files(self, html):
        soup = BeautifulSoup(html, "html.parser")
        css_links = []

        for link in soup.find_all("link", rel="stylesheet"):
            href = link.get("href")
            if href:
                css_links.append(urljoin(self.url, href))

        return css_links

    def extract_colors(self):

        response = requests.get(self.url, timeout=10)
        html = response.text

        css_files = self.fetch_css_files(html)

        css_content = html

        # Download external CSS
        for css in css_files:
            try:
                css_response = requests.get(css, timeout=10)
                css_content += css_response.text
            except:
                pass

        # HEX colors (#fff or #ffffff)
        hex_colors = re.findall(r'#[0-9a-fA-F]{3,6}', css_content)

        # RGB / RGBA colors
        rgb_colors = re.findall(r'rgba?\((.*?)\)', css_content)

        rgb_list = []

        for h in hex_colors:
            try:
                rgb_list.append(self.hex_to_rgb(h))
            except:
                pass

        for r in rgb_colors:
            try:
                parts = r.split(",")[:3]
                rgb = tuple(int(float(x.strip())) for x in parts)
                rgb_list.append(rgb)
            except:
                pass

        rgb_list = list(set(rgb_list))

        color_names = []

        for rgb in rgb_list:
            color_names.append(self.get_color_name(rgb))

        return list(set(color_names))[:10]