# Job Parser
This parser runs by timer intervals and collect new resumes from job-board websites.

## ENVIRONMENT VARIABLES

## Storage configurations

### MySQL creds:
- **MYSQL_HOST**
- **MYSQL_USER**
- **MYSQL_PASSWORD**
- **MYSQL_DB**

### If you're using Redis
- **REDIS_HOST** _(default: 127.0.0.1)_
- **REDIS_PORT** _(default: 6379)_

## Parsing process
- **TASKS_LIMIT** _(default: 100)_ - how many tasks, parser asks from task's storage;
- **FRESHNESS** _(default: 30)_ - freshness of resumes
- **ROWS_PER_PAGE** _(default: 500)_ - maximum resumes per one page on searching
- **MAX_ERRORS_ACCOUNT** _(default: 5)_ - maximum errors by job-board account, before the account will be excluded
- **DEFAULT_PARSE_LIMIT** _(default: 30)_ - maximum parse resumes by an account at a time
- **MAX_TIMELIMIT_ACCOUNT** _(default: 5)_ - A time limit for status "processing" for the account. In minutes.
- **MAX_HOURS_TASK_PROCESSING** _(default: 1)_ - How long does it take to keep use "processing" status for the tasks?

## Proxy Settings

### If using the ProxyPoolFineproxy class
- **FINEPROXY_LOGIN**
- **FINEPROXY_PASSWORD**

or

### If using the ProxyPoolLink class
- **PROXY_LINK**

## Logger

### Logger ###
You can send logs to console, MySQL or Logstash server (over http/https, codec json)
If you will be use logstash, you can change next settings:
- **LOGSTASH_URL** _(default: https://127.0.0.1:1080)_
- **LOGGER_MODULE** one of the below:
  - **Console** - logs to console
  - **MySQL** - to mysql DB
  - **Logstash** - to logstash over HTTP(S) POST JSON
  - **MySQLConsole** - to MySQL and Console
  - **LogElasticConsole** - to Logstash and Console