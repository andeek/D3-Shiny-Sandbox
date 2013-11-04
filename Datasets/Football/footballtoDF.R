library(igraph)
football.gr <- read.graph("Datasets/Football/football.gml", format="gml")
football.df <- get.data.frame(football.gr, what="vertices")