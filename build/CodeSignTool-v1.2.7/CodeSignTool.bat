@echo OFF

set code_sign_tool_path=%CODE_SIGN_TOOL_PATH%

if defined code_sign_tool_path (
%code_sign_tool_path%\jdk-11.0.2\bin\java -cp "%code_sign_tool_path%\jar\picocli-4.6.1.jar;%code_sign_tool_path%\jar\bcprov-jdk15on-1.65.01.jar;%code_sign_tool_path%\jar\httpclient-4.5.13.jar;%code_sign_tool_path%\jar\json-simple-1.1.1.jar;%code_sign_tool_path%\jar\jsign-core-3.1.jar;%code_sign_tool_path%\jar\commons-io-2.8.0.jar;%code_sign_tool_path%\jar\bcpkix-jdk15on-1.65.jar;%code_sign_tool_path%\jar\code_sign_tool-1.2.7.jar;%code_sign_tool_path%\jar\httpcore-4.4.13.jar;%code_sign_tool_path%\jar\commons-logging-1.2.jar;%code_sign_tool_path%\jar\log4j-api-2.17.1.jar;%code_sign_tool_path%\jar\log4j-core-2.17.1.jar;%code_sign_tool_path%\jar\poi-4.1.2.jar;%code_sign_tool_path%\jar\commons-lang3-3.9.jar;%code_sign_tool_path%\jar\commons-math3-3.6.1.jar;%code_sign_tool_path%\jar\totp-1.0.jar;%code_sign_tool_path%\jar\commons-codec-1.15.jar" com.ssl.code.signing.tool.CodeSignTool %*
) else (
.\jdk-11.0.2\bin\java -cp ".\jar\picocli-4.6.1.jar;.\jar\bcprov-jdk15on-1.65.01.jar;.\jar\httpclient-4.5.13.jar;.\jar\json-simple-1.1.1.jar;.\jar\jsign-core-3.1.jar;.\jar\commons-io-2.8.0.jar;.\jar\bcpkix-jdk15on-1.65.jar;.\jar\code_sign_tool-1.2.7.jar;.\jar\httpcore-4.4.13.jar;.\jar\commons-logging-1.2.jar;.\jar\log4j-api-2.17.1.jar;.\jar\log4j-core-2.17.1.jar;.\jar\poi-4.1.2.jar;.\jar\commons-lang3-3.9.jar;.\jar\commons-math3-3.6.1.jar;.\jar\totp-1.0.jar;.\jar\commons-codec-1.15.jar" com.ssl.code.signing.tool.CodeSignTool %*
)