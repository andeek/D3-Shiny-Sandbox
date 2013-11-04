##florentine data

#source("http://bioconductor.org/biocLite.R")
#biocLite("SNAData")

library(SNAData)
data(florentineAttrs, business, marital)

business.g <- igraph.from.graphNEL(business)
marital.g <- igraph.from.graphNEL(marital)


write.graph(marital.g, "Datasets/Florentine/marital.gml", format="gml")
write.graph(business.g, "Datasets/Florentine/business.gml", format="gml")

# 
# 
# # Node data: families
# families = florentineAttrs
# ties = families[,"NumberTies"]
# 
# # Edges: business relationships
# # Add edge names
# e = t(edgeMatrix(business))
# src = nodes(business)[e[,1]]
# dest = nodes(business)[e[,2]]
# edgenames = paste(src, dest, sep="->")
# # Add edge weights: the average of the two node variables
# weights = matrix((ties[e[,1]] + ties[e[,2]]) / 2, ncol=1)
# dimnames(weights) = list(edgenames, c("meanTies"))
# 
# gg$business = data.frame(weights)
# edges(gg$business) = cbind(src, dest)
# 
# # Edges: marital relationships
# # Add edge names
# e = t(edgeMatrix(marital))
# src = nodes(marital)[e[,1]]
# dest = nodes(marital)[e[,2]]
# edgenames = paste(src, dest, sep="->")
# # Add edge weights: the average of the two node variables
# weights = matrix((ties[e[,1]] + ties[e[,2]]) / 2, ncol=1)
# dimnames(weights) = list(edgenames, c("meanTies"))
# 
# gg$marital = data.frame(weights)
# edges(gg$marital) = cbind(src, dest)