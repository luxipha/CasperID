import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SlideToViewCard extends StatelessWidget {
  final double height;
  final Widget? child;
  final Function? dismis;
  final DismissDirection direction;

  const SlideToViewCard({
    Key? key,
    this.height = 10,
    this.child,
    this.dismis,
    this.direction = DismissDirection.endToStart,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    GlobalKey globalKey = GlobalKey();

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Stack(
        children: [
          child ??
              SizedBox(
                height: height,
                child: Center(
                  child: Text('Hello'),
                ),
              ),
          Dismissible(
            onDismissed: (Value) {
              dismis!();
              print("Value $Value");
            },
            key: globalKey,
            direction: direction,
            child: Container(
              width: MediaQuery.of(context).size.width,
              height: height,
              // padding: EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                // color: Colors.green.withOpacity(0.98),
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF26C565).withOpacity(0.95),
                    Color(0xFF26C565),
                  ],
                  stops: const [0.0, 1.0],
                  begin: FractionalOffset.centerLeft,
                  end: FractionalOffset.centerRight,
                  tileMode: TileMode.repeated,
                ),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                         SizedBox(
                          width: 10,
                        ),
                        Icon(
                          Icons.lock_outline,
                          color: Colors.white,
                          size: 30,
                        ),
                        SizedBox(
                          width: 5,
                        ),
                        Text(
                          'Slide to view score',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: const [
                        Icon(
                          CupertinoIcons.back,
                          size: 30,
                          color: Colors.white,
                        ),
                        Icon(
                          CupertinoIcons.back,
                          size: 30,
                          color: Colors.white54,
                        ),
                        Icon(
                          CupertinoIcons.back,
                          size: 30,
                          color: Colors.white24,
                        ),
                         SizedBox(
                          width: 10,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
