There are key packages missing due to the default .gitignore of node_modules. 

It is best to leave node_modules that way. 

To install the missing packages,

Go to PROJECT_ROOT/vite-project
Run command "npm install"

To test success, run "npm run dev" and you should see vite deploying a URL.

vite is a good build tool which handles the server, ensuring the browser can access npm packages etc. And it even compiles the code (npm run build) so that for deployment elsewhere you just have a few files (HTML, CSS, JS) which you need to distribute.
