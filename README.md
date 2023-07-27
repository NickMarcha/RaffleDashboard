# DGG Raffle Dashboard

This is repo to manage a wepapp consisting of

- Static React Frontend
- Node Expess JWT Authenticated Backend
  - Database in google sheets
  - Routinly scrapes [Charity Donationlist](https://www.againstmalaria.com/Fundraiser.aspx?FundraiserID=8960) for new entries.
  - Simple auth free api intended for use in OBS overlays

The webapp is currently hosted on a ec2-aws instance with nginx configured with Cloudflare SSL sertificate.
The nginx will proxy any requests needed to the backend api server when needed, any request with root path `/api`

Datbase is here [here](https://docs.google.com/spreadsheets/d/1IaLXgyMT9uX4uqVKvFdThEAT4QsIvRpCXSc2CephOWU) (You need access.)

Up to date export of raw data is available [here](https://docs.google.com/spreadsheets/d/1ueMA5oPhetFo6zYaWveGBL984NJahuB4jw-iZC8mHVI/)

Up to date export of Donation statistics found [here](https://docs.google.com/spreadsheets/d/e/2PACX-1vT02jloyxs18l0kZa3v216iIpRVfIO339nwWXAgPnFVlipoTTVo3x6XkN74NFMhwJok2IC5ccb2749v/pubhtml?gid=1688478255&single=true)

## My Todo list

- [ ] JWT Authentication
  - [x] login
  - [x] register
  - [x] Auth Token
  - [ ] Refresh Token
- [x] HTTPS

## Configuration

### Inital setup

#### prerequistes

- Ubuntu ec2 AWS instance \w putty connection (remember to open neccesary ports)
- github repo ( preferably precompiled build included, not server)
  - tip generate a github key which can be stored so you don't need password everytime.
- mongodb cluster, \w security configured to allow access from server host

#### Preparing Ubuntu instance

```
// update package list
sudo apt update
```

```
1- // this line installs curl on the Ubuntu server
$ sudo apt-get install curl
2- // this line downloads Node.js
$ curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
3- // this line installs node
$ sudo apt-get install nodejs
```

```
// Store github credentials
git config --global credential.helper store
git config --global credential.https://github.com.%githubUsername% %githubAccessToken%
```

```
// clone production branch
git clone --branch production https://github.com/NickMarcha/NickMarchaPortfolio.git
```

the `RaffleDashboard/server` folder needs a `.env`` with you google service account and key configuration. As well as a JWT_SECRET

```
GOOGLE_SERVICE_ACCOUNT_EMAIL="youthing@yourthing.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n your key here\n-----END PRIVATE KEY-----\n"
JWT_SECRET="your long personal password here"
HOST_URL="http://%Your Host IP%/"
DOMAIN_NAME="https://example.com/"
```

Preparing `nginx` (fuller guide [here](https://plainenglish.io/blog/hosting-a-react-app-to-ec2-using-nginx-with-ssl-certificate-6575b58ea8a8))

```
//make sure you are superuser for installs
sudo su
sudo apt install nginx
//Verify status
service nginx status
//start service
service nginx start
```

Remove default config and create your own

```
cd /etc/nginx/sites-enabled
rm default
nano client-config
```

My `client-config`

```
server {
    listen 443 ssl;
    server_name www.example.com;
    ssl_certificate /home/ubuntu/cert/cert.pem;
    ssl_certificate_key /home/ubuntu/cert/key.pem;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

The sertificate referenced is an origin SSL provided by cloudfare it is stored in the root directory in `/cert/` this enables cloudfare full proxy as well as `https`.

To get cors working be sure to change the accepted header urls in `server/index.json`

#### Running the Build

Go back inside the root folder `RaffleDashboard`
run

```
npm run installAll
```

This should run npm install in root, client and server folders. running in the root folder enables easy start of server using [concurrently](https://www.npmjs.com/package/concurrently).

Serving frontend & backend

```
npm run serve
```

This will serve both fronend and backend at the same time.

##### Tip

SHHing into your ubuntu instance the process will likely close as you end your session.
Some helpull tmux commands to keep process running and reachable.

```
//create new session
tmux new -s webapp
//list sessions
tmux list-sessions
// Re enter session
tmux attach -t %sessionName%
```

You can now close your ssh session without shutting down you app.

#### Development

For development a nginx is not needed the [React Developoment proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/) is enough (already installed).
it is sufficient to run the script `npm run installAll` in the root `package.json`.

setup the file `server/.env`
with development credentials:

```
#Google Auth
GOOGLE_SERVICE_ACCOUNT_EMAIL="raffledevelopment@dggraffle.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyQkd6MUIqWxmw\nadVc7Jw1tLemUjp66NnxYnpyORuAwyMwTtbMrF6C20K0W2Kj3EhO3krJu3T+CGkD\n82LaA8rhK98yMhRb4u2OLPEdzh7ZttZYhxznjy6eJSHl2vbHMCB8WBkXfC6N6+h0\nBamlxOUr/Zug80aOgeRliQQXmLGN7lAiqbUNcgq+bzSQQR1GpSt4szNRddW0oW8N\n2SGz6uvqfaosoqKdw4NJ9EzsAbD07mF2dS0cIfP45o9S0OfMJTYb25g8C1KKlMPX\nNQPxwTglBOR1ykDBE8V77CBRosIAkrecrMsYVozQo8gQV5wutdLauIVN4YpmOWIJ\nC9w4+IRDAgMBAAECggEANyd9wSd7jupoDOb6Dsng3VcgmZQIpx3jzSWIuE3GHjWC\nbkB+go50oa1gurgp0YRnVQu/fSKEpNMKVyAXvlf9DmWKJhhLp1CT6vEp22x6rCc/\ns91+SoFJTcI0dk+lGmVgL8j8XoFcUColXryfzHwa4l0SKZ8L/izfc7EMtJZYnY6R\nDSWiNLPl3+2XGR1QPTacdE/c+kuwwKb2e9epSgPSjiyYCi35Bkw/3qXzyfGQYNuN\noVhaBznsLh2sx4Lk3oWPyE5W+RgjNt7Tpkk2JaKifssFzYt7E7un5cMNHGx0QMEP\n8U6wnUoMa5GhGLZO+2hfx0GIG1T+/OnlYTJFEKCA1QKBgQD01czoqkquL5i6hLOg\nWW235xKdFenIIubq8vpIMzmnBy43N/2LCh61/6o+dDPF1jvLUNT9yeoazIZYyJqX\ng7XBfvxtbl7kaWBlM0fKFSFhvm+Zz0uN7qrIPT4O20POJQBpr+ui4NvV/Sr8zs64\nv7W8Sr209gJM7+t7k71D7i191wKBgQC6Y0TsbMXG5iumWw8FRkLs4CF7ksHdoOHI\nqqPnEnntYQOO+RazS1aAJ11sfiM4aP1Bl+zDKctIQ9qBOd2U3LIpSdST5+ztMtJu\nrCWtxbaKpxOvEuAhDYxWTSrndbuHOYcfZC8JzcNmI6hoC7ddQREULLgrSbZEupZQ\nA2XIjUfndQKBgFwJMuoTeddY1RToZY3VkEUdfAXJAwTU+fFAPY1+lCGRtXHUfl8S\nAtFvtlOb4wpvqjKXxDlS+cnxMF+XqWVjgaOnVMTeRJWgdzgTutzgbJgNum4bWs+T\n9GcpfnafPjHz/t+73dxworMiZFJ8e4E/r9WEUyP/hoXdeqwNsYwjsL4pAoGALrRN\nQwkGjg6DBY5vtxyiDIUlHrfpiEWWDhhkNbS1hLv4jkzwWUEZjcdPa6432RzFyTfu\nhgDlBVirWhJL6c9bfWkYsW8+OTmw7TaJwn92fEvdbNNIAkBI2B9CDvm7YekSaNVL\nzCMZQXDR9DBrZBy30Nxb0c0ItTQkEiynxpdQWzkCgYAG4PbA3ufCbCOf88E3FH0F\n86KMpFC19OmpYDIuNHC/l3T2ZteRqjF5njRfxzDfe44Ce2mmYUzc5CkiE47ABqcW\n8cXLsv6P8DHruL9QG3jM8vk8MIXB4JSKrvdoxYhsxu10B4jdaMPSsKq4DQmHJMIf\nNwc6WRJKQG1NNOgJmuuQwA==\n-----END PRIVATE KEY-----\n"
#Sheets
SHEETS_DB_ID=1wxwP5l6ylWepY5IgUtEHmvHj9x-Xrq1zKLO0irvv5p0
SHEETS_AUTHDB_ID=1pkzu1JVZJUieYG7zYufk4BB-hjVQqn9BPq3dv2Dg5oo/
#Hosting
JWT_SECRET="YourMomWooyeah"
HOST_URL="localhost"
DOMAIN_NAME="localhost"
```

and run

```
npm run start
```

You should be able to see live changes in [dev database](https://docs.google.com/spreadsheets/d/1wxwP5l6ylWepY5IgUtEHmvHj9x-Xrq1zKLO0irvv5p0/edit#gid=1189653142)

This will start the react development server in `/client` and in `/server` a [nodemon](https://www.npmjs.com/package/nodemon) instance.
