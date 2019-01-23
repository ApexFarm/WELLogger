# Well Logger
WELLogger is a thin wrapper around `System.debug`. It aims to pretty format objects from classes such as Exception, and HttpResponse etc automatically.
```java
System.debug(ex.getMessage() + ': ' + ex.getStackTrackMessage()); // no more this
WELLogger.debug(ex); // just do this
```
In addition, it also has the following features:
1. Output logs to database sObject `WELLog__c`.
2. Output logs to `WELLogger.logs` array, which can be exposed to external API with customization.
3. Categorize logs by namespaces, i.e. `module_name:feature_name:modifier`.
4. Control logging levels through settings by both outputs and namespaces.

## Installation

Upload all source codes under directory `src/logger` to your organization. The best and currently "only" way to update them is via VS Code IDE or sfdx-cli. Because the library is developed with VS Code [Salesforce CLI Integration](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-core) extension.

## Usage

Its usage is as simple as `System.debug` API. When used in this way, a `main` namespace will by assigend to the logs by default.

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

### Namspaces

Each log must have a namespace. A namespace should generally follow the pattern as below. But good pattern can always be invented to suit your project needs.

`module_name:feature_name:modifier`

| Namespace Part | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| Module Name    | **Required**. Module name should be short and descriptive words. |
| Feature Name   | **Optional**. Feature name could be a function name or a class name. |
| Modifier       | **Optional**. Supplement to the feature name.                |

#### Modue Log Settings

Logs sharing the same module name are controlled by the logging levels in the WELLog Setting custom metadata type. There are two built-in WELLog Settings for `main` and `default` modules. If a module name doesn't exist in the WELLog Setting, the `defualt` setting will be applied to the logs of that module.

![settings.png](doc/settings.png)

| Field Name        | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| Label             | The module name, the first name appeared in the namespace.   |
| Enabled           | Toggle the logs output for an entire module.                 |
| Logging Level *** | Controls the logging level for each of the three output types. |

#### Custom Namespace

Here is an example for how to define loggers with custom namespaces:

```java

```
### Logging Outputs

The library supports 3 output types:

| Output   | Description                                                  | Best Practice                                                |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Database | Persist logs into sObject `WELLog__c`, after calling `WELLogger.save()` method. | Only enable this output for critical issues and exceptions.  |
| Debug    | Persist logs into the standard system debug logs.            | Main debug methodology, used for daily development debugging activities as well as production debug, and performance tuning etc. |
| API      | Logs will not be persisted. Pull logs when needed from `WELLogger.logs`. | It is useful when logs can be viewed externally. It won't impact the 250MB debug log size, when APIs are called frequently and there are a lot of data/messages carried. |

#### Database Output

Here is an example for how to use `WELLogger.save()` to save logs into the database when logging level permits. Please limit this try catch pattern only to the excecution context entrance methods, such as execute method for batch classes etc.

```java
public class MyAccountController {
    static WELLogger.Logger logger = WELLogger.get('acct:MyAccountController');
	
    class Response {
        Object data { get; set; }
        Object logs { get; set; }
    }
    
    @RemoteAction
    public Response doSomeWork() {
        Response res = new Response();
        try {
            logger.debug('do some work');
            logger.debug('do some work');
        } catch (Exception ex) {
            logger.debug(LoggingLevel.Error, ex);
        } finally {
            WELLogger.save(); // save to database
            res.logs = WELLogger.logs; // output logs to browser
        }
        return res;
    }
}
```

#### API Output - Browser

In the above example we also output the logs to the browser when logging level for the module permits. In the front end we can print the logs in the developer console with a helper weblogger.js.

```html
<apex:page name="WELSample" controller="WELSampleController">
  <apex:includeScript value="{!URLFOR($Resource.WELLogger, 'wellogger.js')}"/>
  <script>
    Visualforce.remoting.Manager.invokeAction(
      '{!$RemoteAction.WELSampleController.doSomeWork}',
      function(result, event){
        if (event.status) {
          wellogger(result.logs);
        } else {
          console.log(event);
        }
      },
      {escape: true}
    );
  </script>
</apex:page>
```

To view the logs in Chrome developer console, `Verbose` must be selected for the logging level. More examples are within `src/sample` directory.

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


