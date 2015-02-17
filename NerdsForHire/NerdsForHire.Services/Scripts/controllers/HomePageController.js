function HomePageController() {
        var vm = this;
        vm.Title = "FSharp Web Kit";
        vm.DoStuff = doStuff;

        function doStuff() {
            return "stuff";
        }
    }
