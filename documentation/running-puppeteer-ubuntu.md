How to resolve Puppeteer dependencies like error while loading shared libraries: libgtk-3.so.0
[By R0bin | dev | 23 Oct 2020](https://www.publish0x.com/dev/how-to-resolve-puppeteer-dependencies-like-error-while-loadi-xwnjgee)

One fine day I had to leave my already somewhat dusty development environment on an older Ubuntu distribution. On a freshly installed Ubuntu 20 server I wanted to continue my development work with NodeJS and Puppeteer. But before that, some dependencies had to be fulfilled, otherwise the script aborted with an "Error: Failed to launch the browser process!

My environment:

- Ubuntu 20.04.1 LTS
- NodeJS v10.19.0
- npm 6.14.1
- Puppeteer 5.3.1

Here are the solutions I have found:

Error: error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory
Solution: $ sudo apt install libnss3-dev

Error: error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file: No such file or directory
Solution: $ sudo apt install libatk1.0-0

Error: error while loading shared libraries: libatk-bridge-2.0.so.0: cannot open shared object file: No such file or directory
Solution: $ sudo apt install libatk-bridge2.0-0

Error: error while loading shared libraries: libcups.so.2: cannot open shared object file: No such file or directory
Solution: $ sudo apt install libcups2

Error: error while loading shared libraries: libgbm.so.1: cannot open shared object file: No such file or directory
Solution: $ sudo apt install libgbm1 (Do not forget the number 1 at the end!)

Error: error while loading shared libraries: libpangocairo-1.0.so.0: cannot open shared object file: No such file or directory
Solution: $ sudo apt install libpangocairo-1.0-0

Error: error while loading shared libraries: libgtk-3.so.0: cannot open shared object file: No such file or directory
Solution: $ sudo apt install libgtk-3-0

You can also install all packages in one go:
$ sudo apt install libnss3-dev libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 libpangocairo-1.0-0 libgtk-3-0

And then it can go...

One more hint: The more time elapses, the more likely it is that the above mentioned package names are no longer up to date, because they contain version numbers.
So before you eagerly copy and paste the commands into your command line, you should use

$ apt-cache list | grep <packagename without version number>
For example: $ apt-cache list | grep libatk

and look up the current names of the packages and use them.

Happy coding!
