##converts housing data to proper gml
library(igraph)

housing <- read.csv("Datasets/Housing//housing.network.csv", sep=",", header=TRUE)
housing <- subset(housing, Relationship > 0)
                  
#check identical
identical(sort(unique(housing$Player1)), sort(unique(housing$Player2)))

graph<-graph.data.frame(housing[,1:2])
E(graph)$weight <- housing[,3]
V(graph)$label <- V(graph)$name

write.graph(graph, "Datasets/Housing/housing.gml", format="gml")
