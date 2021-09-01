# Job Parser
This parser runs by timer intervals and collect new resumes from job-board websites.

## ENVIRONMENT VARIABLES

### MySQL creds:
- **MYSQL_HOST**
- **MYSQL_USER**
- **MYSQL_PASSWORD**
- **MYSQL_DB**

### Parsing process
- **TASKS_LIMIT** _(default: 100)_ - how many tasks, parser asks from task's storage;
- **FRESHNESS** _(default: 30)_ - freshness of resumes
- **ROWS_PER_PAGE** _(default: 500)_ - maximum resumes per one page on searching
- **MAX_ERRORS_ACCOUNT** _(default: 5)_ - maximum errors by job-board account, before the account will be excluded
- **DEFAULT_PARSE_LIMIT** _(default: 30)_ - maximum parse resumes by an account at a time
- **MAX_THREADS** _(default: 10)_ - Max parallel threads

### If using the ProxyPoolFineproxy class
- **FINEPROXY_LOGIN**
- **FINEPROXY_PASSWORD**
