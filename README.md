# URL Shortener - Tutorial project for learning git, github, Travis CI, and Docker. 
URL Shortener is a small web service exposing a RESTful HTTP API to create, resolve, and delete short URLs hosted on your own domain. It is written using JavaScript (ES6) and runs on Node.js.

The project serves a basis for a tutorial on git, github, Travis CI, and Docker. It is intended for people having a rough understanding of these different technologies and want to get a hands-on experience.

Please Note: This project serves teaching purposes and it is not meant to be used productively anywhere!

## Information needed to solve the tutorial

### Prerequisites
For this tutorial the following software is needed:
- [Node.js](https://nodejs.org/) (>=6.9): Needed to run and test the project locally. 
- [Git](https://git-scm.com/downloads): Basically any git client can be used, however the CLI version is recommend to get a better feeling for different git commands.
- [Docker](https://docs.docker.com/engine/getstarted/step_one/): Needed to test docker files.

Additionally, a github account is required.

### Project-related Commands
- `npm install`: Install all dependencies
- `npm start`: Start the web service
- `npm run lint`: Check if coding standards are followed
- `npm test`: Test the RESTful API of the URL shortening service. IMPORTANT: The service must be started in order to test it!

All of these commands must be executed in the root directory of the project.

### RESTful HTTP API
- `POST /create` will generate a shortened URL. The URL to be shortened must be passed in to body of the request, either using form data (`url=<long-url>`) or by passing JSON (`{"url": "<long-url>"}`). If successful, status code 201 is returned and the shortened URL is provided in the header field `Location`
- `GET /:id` will redirect to the unshortened URL for the given id. If the id is not found, status code 404 is returned.
- `DELETE /:id` will delete the shortened URL with the given id. 

### Testing the API
The API can be tested in various ways:
- _Automated Testing_: The project comes along with automated API test that can be executed by running `npm test`. It is important that the service runs, otherwise the tests will fail.
- _Manual Browser-based Testing_: Open http://localhost:3000 to use a simple Web UI to manually test the application.

### Project Configuration
The service can run with and without authentication. The following environment variables can be used to configure if authentication shall be activated and which credentials are needed:
- `AUTH`: If set to true, the methods POST and GET will require username and password
- `USER`: username (only needed if AUTH=true)
- `PASSWORD`: password (only needed if AUTH=true)

### Files and Folders
- `/data/`: Each short URL is stored as file within this folder. The filename is the id of the short URL and the long URL is stored as the file content.
- `/node_modules/`: Includes all dependencies downloaded by the package manager.
- `/tests/`: Folder containing all tests (currently just one).
- `.eslintrc`: Configuration file for [ESLint](http://eslint.org/), the tool to check the coding standards.
- `*.js`: Service implementation.
- `package.json`: Configuration file for the package manager

# Exercise

## Task 1: Git & Github
- Login on github and fork this repository.
- Clone the forked repository to your local machine.
- Get the project running in your local environment by installing the dependencies and start the web service. You can manually test, whether or not the service works by accessing http://localhost:3000/
- Create a `.gitignore` file which ensures that only necessary files are checked into the respository.
- Remove any files from the repository that shall not be in it.
- Commit and push your changes to your forked repository.

## Task 2: Travis CI
- Create a `.travis.yml` that enables continuous integration for this project. For this, have a look at the [Travis CI getting started guide](https://docs.travis-ci.com/user/getting-started/).
- Create [build matrix](https://docs.travis-ci.com/user/customizing-the-build/#Build-Matrix) that tests the project for node 6 and 7 as well as with and without authentication.
- Travis shall test if the coding standards are followed and if the API works are intended.
- Ensure that the build only runs on the master branch.
- Information about every build shall be sent to your e-mail adress.
- Syntactically validate your `.travis.yml` on http://lint.travis-ci.org/
- Prepare to run you build by going to [travis-ci.org](http://travis-ci.org), login with your github account, and enable continuous integration for the forked repository.
- AFTER the preparation, push your `.travis.yml` to for forked repository and check the build results on [travis-ci.org](http://travis-ci.org)

## Task 3: Docker
- Create a `Dockerfile`
- Use the [official node.js image](https://hub.docker.com/_/node/) `node:7-slim` as the base image. Other node images will too work, too, but require more disk space.
- Set `NODE_ENV` to `production` so that dev dependencies are ignored within this container.
- Copy all necessary files into the image. Use a `.dockerignore` file to exclude unneeded files.
- Find the correct command sequence to setup the project within the container.
- Identify were the application stores its state and define it as a volume.
- Expose the proper port.
- Ensure that the application is started when the container is started.

### Required Dockerfile Intructions
- FROM: Sets the base image.
- ENV: Set environment variables (can be overwritten by `docker run -e VAR=VALUE`).
- RUN: Run commands to install or configure software.
- ADD/COPY: Copy files to the image.
- USER: User id for CMD, RUN, and ENTRYPOINT instructions.
- EXPOSE: Defines which ports are exposed by the container.
- WORKDIR: Defines the working directory for instructions.
- VOLUME: Directories mounted from the host or other containers.
- CMD: Default commands to be executed (can be overwritten when the container is started).

For more detailed descriptions and examples, have a look at the [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)

### Docker commands to test Dockerfile
```sh
# Build the image:
docker build -t urlshortener .

# Start the container and bind port locally
docker run -d -p 3000:3000 --name myshortener urlshortener

# Service should now be accessible at http://localhost:3000

# Verify that the container is running
docker ps

# Stop the container
docker stop myshortener

# Remove the container
docker rm myshortener
```

## Task 4: Docker and Travis CI
- Use [Travis CI to test the Docker container](https://docs.travis-ci.com/user/docker/). 
- Instead of directly starting the service by calling `npm start`, build and start the container.
- Use the Travis CI node environment to run the tests on the container.
- Try to inject the environment variables so that the service is still tested with and without authentication.

**IMPORTANT(!)**: Run the container in detached mode (flag `-d`) otherwise it will block the build!
