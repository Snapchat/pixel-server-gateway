# Launchpad

Congratulations your Snapchat Launchpad seems to be up and running.

To connect your front-end to this server please include the following front-end code on all pages.

## Updated front-end code:

```
<!-- Snap Pixel Code -->
<script type='text/javascript'>
  (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
          {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
          a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
          r.src=n;var u=t.getElementsByTagName(s)[0];
          u.parentNode.insertBefore(r,u);})(window,document,
  '{{***HOST_URL_GOES_HERE***}}/scevent.min.js');

        snaptr('init', '{{***PIXEL_ID_GOES_HERE***}}', {
  'user_email': '__INSERT_USER_EMAIL__'
              });

        snaptr('track', 'PAGE_VIEW');

</script>
<!-- End Snap Pixel Code -->
```

## Confirming Events

Once you have done that please visit your webpage and confirm that the events are flowing through Events Manager
