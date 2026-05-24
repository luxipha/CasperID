import 'package:flutter/material.dart';

Widget circularProgressView() {
  return Center(
    child: Container(
        height: 96,
        width: 96,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.5),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Image.asset(
            'assets/gif_files/loader_transparent.gif',
            height: 72,
            width: 68,
          ),
        )),
  );
}
