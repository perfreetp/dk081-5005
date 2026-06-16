export default defineAppConfig({
  pages: [
    'pages/find/index',
    'pages/publish/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/chat/index',
    'pages/booking/index',
    'pages/urgent/index',
    'pages/favorites/index',
    'pages/agreement/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '铁甲直卖',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8C95A6',
    selectedColor: '#FF6A00',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/find/index',
        text: '找车'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发车'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
