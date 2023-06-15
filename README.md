# jr-cli
通用模版初始化脚手架

## 所需依赖
- import-local
- npmlog终端日志打印
- semver pkg版本比对工具
- colors 终端文本颜色
- index-exists
- user-home 用户主目录查询
- minimist 参数解析
- commander 脚手架注册
- path-exists

## 分包策略
- core核心代码库
- utils工具库
- commands命令处理
- models模型库

## 相关环境变量
CLI_HOME_PATH 主目录路径
CLI_TARGET_PATH 本地调试路径
LOG_LEVEL 日志等级

## 功能研发进度
1. 脚手架版本检测 ✅
2. Node版本检测  ✅
3. root权限自动降级 ✅
4. 检查用户主目录 ✅
5. 参数和环境变量检查 ✅
6. 通用npm功能封装 ✅
7. 全局参数注册 ✅
8. 脚手架初始化 ✅
9. 动态init   ✅
