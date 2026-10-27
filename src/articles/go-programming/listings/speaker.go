package main

import "fmt"

// the entire contract — one method
type Speaker interface {
	Speak() string
}

type Dog struct{}
type Robot struct{}

func (d Dog) Speak() string   { return "woof" }
func (r Robot) Speak() string { return "beep" }

// polymorphism without inheritance
func announce(s Speaker) {
	fmt.Println(s.Speak())
}

func main() {
	announce(Dog{})   // woof
	announce(Robot{}) // beep
}
