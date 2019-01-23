# Well Logger
WELLogger is a thin wrapper around `System.debug`. It aims to pretty format objects for classes such as Exception, and HttpResponse etc automatically.
```java
System.debug(ex.getMessage() + ': ' + ex.getStackTrackMessage()); // no more this
WELLogger.debug(ex); // just do this
```
In addition, it also has the following features:
1. Output logs to database sObject `WELLog__c`.
2. Output logs to `WELLogger.logs` array, which can be further exposed to external APIs.
3. Categorize logs by namespaces, i.e. `module_name:feature_name:modifier`.
4. Control logging levels for three output types by namespaces.

## Installation

Upload all source codes under directory `src/logger` to your organization. The best and currently "only" way to update them is via VS Code IDE or sfdx-cli. Because the library is developed with VS Code [Salesforce CLI Integration](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-core) extension.

## Usage

Its usage is as simple as `System.debug`.

```java
WELLogger.debug('doing some work');
WELLogger.debug(ex);
WELLogger.debug(LoggingLevel.Error, 'doing some work');
WELLogger.debug(LoggingLevel.Error, ex);
```
And two additional APIs are provided for convinience.
```java
WELLogger.debug('an error occurred', ex);
WELLogger.debug(LoggingLevel.Error, 'an error occurred', ex);
```

When used in this way, all logs will be default to the `main` namespace implicitly.

### Namespaces

Each log must have a namespace. A namespace should generally follow a pattern like `module_name:feature_name:modifier`.

| Namespace Part | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| Module Name    | **Required**. Module name should be short and descriptive words. |
| Feature Name   | **Optional**. Feature name could be a function name.         |
| Modifier       | **Optional**. Supplement to the feature name.                |

But good namespace pattern can always be invented to suit your project needs. `module_name:class_name` is not a good alternative, but may be useful in some circumstances.

#### Module Logging Settings
Module logging settings are controlled by the `WELLogSetting__mdt` custom metadata type. There are two built-in module logging settings `main` and `default`. All logs printed from `WELLogger.debug` API are controlled by the `main` module logging setting.

![settings.png](doc/settings.png)

| Field Name        | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| Label             | A module name, the first name appeared in the namespace.     |
| Enabled           | Toggle the logs output for an entire module.                 |
| Logging Level *** | Controls the logging level for each of the three output types. |


#### Custom Namespace

If a custom module doesn't exist in the WELLog Setting, the `default` setting will be used to control the logging levels. Here is an example for how to define loggers with custom namespaces. Custom loggers have the same APIs as the `WELLogger.debug` APIs.

```java
// NOTE: WELLogger.LoggerInterface and WELLogger.ILogger can be used interchangeably
WELLogger.ILogger logger = WELLogger.get('module_name:feature_name:modifier');
logger.debug('doing some work');
logger.debug(ex);
```
### Logging Outputs

The library supports three output types:

| Output   | Description                                                  | Best Practice                                                |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Database | Persist logs into sObject `WELLog__c`, after calling `WELLogger.save()` method. | Only enable this output for critical issues and exceptions.  |
| Debug    | Persist logs into the standard system debug logs.            | Main debug methodology, used for daily development debugging activities as well as production debug, and performance tuning etc. |
| API      | Logs will not be persisted. Pull logs when needed from `WELLogger.logs`. | It is useful when logs can be viewed externally. It won't impact the 250MB debug log size, if APIs are called frequently and a lot of data/messages are carried. **Note**: This should be turned off on production, unless another level of security is implmented on top of this library. |

#### Database Output

Here is an example for how to use `WELLogger.save()` to save logs into the database if logging level permits. Please limit this try catch pattern only to the entrance methods of the current excecution context, such as execute method for batch classes etc.

```java
public class MyAccountController {
    // NOTE: WELLogger.LoggerInterface and WELLogger.ILogger can be used interchangeably
    static WELLogger.ILogger logger = WELLogger.get('acct:MyAccountController');
    
    class Response {
        Object data { get; set; }
        Object logs { get; set; }
    }
    
    @RemoteAction
    public Response doSomeWork(String param1, String param2) {
        logger.debug('[M:E] doSomeWork');   // log for method enter
        logger.debug('[P:param1]', param1); // log for parameter
        logger.debug('[P:param2]', param2); // log for parameter
        
        Response res = new Response();
        try {
            logger.debug('do some work');
            logger.debug('do some work');
        } catch (Exception ex) {
            logger.debug(LoggingLevel.Error, ex);
        } finally {
            WELLogger.save();          // 1. output logs to database
            res.logs = WELLogger.logs; // 2. output logs to browser
        }
        
        logger.debug('[M:X] doSomeWork');   // log for method exit
        return res;
    }
}
```

#### API Output - Browser

In the above example we can also see a log output to the remote action response. We can print these logs in the developer console with wellogger.js helper.

```html
<apex:page name="WELSample" controller="WELSampleController">
  <apex:includeScript value="{!URLFOR($Resource.WELLogger, 'wellogger.js')}"/>
  <script>
    Visualforce.remoting.Manager.invokeAction(
      '{!$RemoteAction.WELSampleController.doSomeWork}',
      function(result, event){
        if (event.status) {
          wellogger(result.logs);
        }
      },
      {escape: true}
    );
  </script>
</apex:page>
```

To view the logs in Chrome developer console, select `Verbose` as the logging level. Source codes for both remote action and lightning component are in the directory `src/sample`.

![console.png](doc/console.png)

## License
MIT License

Copyright (c) 2019 Jianfeng Jin

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


