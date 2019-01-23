# Well Logger
WELLogger is a thin wrapper around `System.debug`. It aims to auto pretty format objects from classes such as Exception, and HttpResponse etc.
```java
System.debug(ex.getMessage() + ': ' + ex.getStackTrackMessage()); // no more this
WELLogger.debug(ex); // and do this
```
In addition, it also has the following features:
1. Output logs to database sObject `WELLog__c`.
2. Output logs to `WELLogger.logs` array, which can be exposed to external API with customization.
3. Categorize logs by namespaces.
4. Control logging levels by both outputs and namespaces.

## Installation
Upload all source codes under directory `src/logger` to your organization. The best and currently "only" way to update them is via VS Code IDE or sfdx-cli. Because the library is developed with VS Code [Salesforce CLI Integration](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-core) extension.

## Usage

```java
WELLogger.debug('');
WELLogger.debug(ex);
WELLogger.debug(LoggingLevel.Error, '');
WELLogger.debug(LoggingLevel.Error, ex);
```

```java
WELLogger.debug('', ex);
WELLogger.debug(LoggingLevel.Error, '', ex);
```

### Logging Levels
![settings.png](doc/settings.png)


### Namspaces

```java
public class MyAccountController {
    static WELLogger.Logger logger = WELLogger.get('acct:MyAccountController');

    public void doSomeWork() {
        try {
            logger.debug('');
            logger.debug('');
        } catch (Exception ex) {
            logger.debug(LoggingLevel.Error, ex);
        } finally {
            WELLogger.save(); // save to database
        }
    }
}
```

### Database Output

### Web Output

![console.png](doc/console.png)

## License
MIT License

Copyright (c) 2019 SalesforceLibrary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


