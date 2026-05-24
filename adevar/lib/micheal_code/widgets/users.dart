import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

Widget UsersWidget(String? img, BuildContext context) {
  var size = MediaQuery.of(context).size;
  return Padding(
    padding: EdgeInsets.symmetric(horizontal: size.height * 0.005),
    child: CircleAvatar(
      // height: size.height * 0.04,
      radius: size.height * 0.02,
      backgroundColor: Colors.white,
      backgroundImage: AssetImage('assets/images/adevar_logo.png'),
      foregroundImage: NetworkImage(
        img ??
            'https://w0.peakpx.com/wallpaper/673/485/HD-wallpaper-raven-crow-crow-dark-for-phone-glow-glowing-hasaka-iphone-xr-itachi-mangekyou-neon-neon-phone-phone-x-portrait-raven-red-red-glow-rock-sharingan-sky-triangle-neon.jpg',
      ),
    ),
  );
}
