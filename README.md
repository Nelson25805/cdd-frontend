<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Nelson25805/cdd-frontend">
    <img src="GithubImages/logo.png" alt="Logo" width="200" height="200">
  </a>

<h3 align="center">CDD Frontend</h3>



  <p align="center">
    An application to search for games using the IGDB API.
    <br />
    <a href="https://github.com/Nelson25805/cdd-frontend"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Nelson25805/cdd-frontend">View Demo</a>
    &middot;
    <a href="https://github.com/Nelson25805/cdd-frontend/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/Nelson25805/cdd-frontend/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <!-- <li><a href="#roadmap">Roadmap</a></li> -->
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

![Project Name Screen Shot][project-screenshot]

`cdd-frontend` is the React single-page application that provides the user interface for the CDD project. It focuses on an intuitive UI for collectors to find, organize, discuss, trade, and wish for video games.

### Key Features

- CDD stands for Collect, Discover, Discuss — the three primary actions this app enables for game collectors.

- Search games (IGDB + user-submitted entries) and view rich game details.

- Add games to your collection with metadata: estimated value, condition/status, completion state, console/platform, notes.

- Maintain a wishlist — select desired consoles for each wish item.

- Add other users as friends and privately message them.

- View other friends wishlist's and collections of games

- Admin UI elements (report hooks and dashboard views) to inspect site metrics such as total users, most-wished-for games, top collectors, etc. (backend required; UI elements shown where applicable).

- Supabase is used for authentication, real-time DB operations, and storage of user & collection data.

This README covers **frontend** setup and usage. Backend (API, database, auth, IGDB integration) is documented separately.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


  ### Built With

| Badge | Description |
|:-----:|-------------|
| [![React](GithubImages/react_badge.svg)][Python-url] | UI library. |
| [![Vite](GithubImages/vite_badge.svg)][PyQt5-url] | dev server + bundler. |
| [![Supabase](GithubImages/supabase_badge.svg)][qdarkstyle-url] | Authentication, database (Postgres), and realtime features. |
| [![cdd-backend](GithubImages/cdd_backend_badge.svg)][igdb-api-url] | server layer which handles IGDB integration, additional API logic, and server-only secrets. |
| [![Plain CSS](GithubImages/css_badge.svg)][pandas-url] | General styling solution |


<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

To start, you have two options of using this software.
1) Run the .exe file
2) Run the python code script manually

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Nelson25805/cdd-frontend.git
   ```
   
2. If using option 1, skip to step 5.
   If using option 2, continue reading.
   
3. You must have python downloaded on your machine, or in your IDE of choice.
   [Python Download](https://www.python.org/downloads/)

4. Install the required packages:
   ```sh
   pip install -r requirements.txt
   ```
   
5. Create account for IGDB Api requests following their steps:
   [IGDB Api Getting Started](https://api-docs.igdb.com/#getting-started)

7. Create a .env file with your unique CLIENT_ID, and CLIENT_SECRET as shown in this fake test example here:
   ![Project Name Screen Shot][project-screenshot5]

8. Depending on where you run the application, place .env file into same folder as .exe, and or the main project folder. 

9. Either run the application from the .exe in the dlist folder, or by executing:
    ```sh
   python main.py
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

This README documents general flows and UI expectations — the app is interactive and the best way to explore is to run it locally.

Example user flows:

- Sign up / Log in (Supabase auth)

- Search for a game (results include IGDB-sourced entries and any user-submitted games)

- Open a game detail page, add to collection: set value, status (e.g., Loose / Sealed), completion, console, notes

- Add a game to wishlist and select which consoles you want it for

- View other user profiles and add them as friends

- Open or participate in message threads to discuss collections, trades, or sales

- Admin users: access dashboard pages showing site stats (total users, top wished games, report queue)

- Screenshots / GIFs are stored in GithubImages/ — replace or update them with current UI captures.

### Filtered Game Search:
![Project Name Screen Shot][project-screenshot2]

This page allows you to search for games with the selected filters, and afterwards save results to a coresponding excel file.


### Random Game Search:
![Project Name Screen Shot][project-screenshot3]

This page allows you to search for a random game in the IGDB database, giving you related information about said game if it's available.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
<!--
## Roadmap

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
    - [ ] Nested Feature

See the [open issues](https://github.com/Nelson25805/cdd-frontend/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/Nelson25805/cdd-frontendgraphs/contributors">
  <img src="https://contrib.rocks/image?repo=Nelson25805/cdd-frontend" alt="contrib.rocks image" />
</a>



<!-- LICENSE -->
## License

Distributed under the project_license. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Nelson McFadyen <!-- - [@twitter_handle](https://twitter.com/twitter_handle) --> - Nelson25805@hotmail.com

Project Link: [https://github.com/Nelson25805/cdd-frontend](https://github.com/Nelson25805/cdd-frontend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Nelson25805/cdd-frontend.svg?style=for-the-badge
[contributors-url]: https://github.com/Nelson25805/cdd-frontend/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Nelson25805/cdd-frontend.svg?style=for-the-badge
[forks-url]: https://github.com/Nelson25805/cdd-frontend/network/members
[stars-shield]: https://img.shields.io/github/stars/Nelson25805/cdd-frontend.svg?style=for-the-badge
[stars-url]: https://github.com/Nelson25805/cdd-frontend/stargazers
[issues-shield]: https://img.shields.io/github/issues/Nelson25805/cdd-frontend.svg?style=for-the-badge
[issues-url]: https://github.com/Nelson25805/cdd-frontend/issues
[license-shield]: https://img.shields.io/github/license/Nelson25805/cdd-frontend.svg?style=for-the-badge
[license-url]: https://github.com/Nelson25805/cdd-frontend/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/nelson-mcfadyen-806134133/

[project-Image]: GithubImages/projectImage.png

[project-screenshot]: GithubImages/mainScreen.png
[project-screenshot2]: GithubImages/filteredGameSearch.gif
[project-screenshot3]: GithubImages/randomGameSearch.gif

[project-screenshot4]: GithubImages/excelExample.png
[project-screenshot5]: GithubImages/envExample.png


[Python-url]: https://www.python.org/downloads/
[PyQt5-url]: https://pypi.org/project/PyQt5/
[qdarkstyle-url]: https://pypi.org/project/QDarkStyle/
[igdb-api-url]: https://api-docs.igdb.com/
[pandas-url]: https://pandas.pydata.org/

[Python]: https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54
[Python-url]: https://www.python.org/downloads/
[Tkinter]: https://img.shields.io/badge/Tkinter-8.6-green
[Tkinter-url]: https://docs.python.org/3/library/tkinter.html


[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 

